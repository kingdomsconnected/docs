---
title: Control World Builder over HTTP
description: Use PowerShell and JSON-RPC requests to inspect World Builder and change its grid without an AI assistant.
sidebar:
  label: World Builder HTTP
  order: 98.5
---

Control an offline editor from a local script, a desktop tool, or a build
workflow. This example reads its state and enables a half-metre grid with
matching movement snap, then restores those settings.

## Before you start

- Use the **1.6.6** client and open an offline World Builder project.
- [Start its MCP server](../../world/world-builder-mcp/#connect-an-assistant)
  on port `7781`.
- Open PowerShell on the same computer. Leave the editor open and finish
  any active drag or text edit before running the example.

You will learn to discover tools, send edits with a current revision, and
wait for queued work. There is no game resource to install. Save the code
from steps 1 through 3 as `world-builder.ps1`, or run the blocks in order
in one PowerShell window.

## 1. Connect to the endpoint

The HTTP API uses **JSON-RPC at `POST /mcp`**. There are no separate REST
routes such as `/objects` or `/camera`. Any HTTP client can send these
requests. This example uses the server's supported **2025-11-25 compatibility
protocol** and JSON responses. The server also supports its newer MCP
discovery path; keep the protocol header and handshake consistent.

```powershell
$WbUri = 'http://127.0.0.1:7781/mcp'
$WbHeaders = @{
    Accept = 'application/json, text/event-stream'
    'MCP-Protocol-Version' = '2025-11-25'
}

function Invoke-WbRpc {
    param([string]$Method, [hashtable]$Params = @{})
    $body = @{
        jsonrpc = '2.0'
        id = [guid]::NewGuid().ToString()
        method = $Method
        params = $Params
    } | ConvertTo-Json -Depth 40 -Compress
    $reply = Invoke-RestMethod -Uri $WbUri -Method Post -Headers $WbHeaders `
        -ContentType 'application/json' -Body $body -TimeoutSec 15
    if ($null -ne $reply.error) {
        throw ($reply.error | ConvertTo-Json -Depth 20 -Compress)
    }
    return $reply.result
}

$connection = Invoke-WbRpc 'initialize' @{
    protocolVersion = '2025-11-25'
    capabilities = @{}
    clientInfo = @{ name = 'world-builder-script'; version = '1.0.0' }
}
if ($connection.protocolVersion -ne '2025-11-25') {
    throw 'Unexpected protocol version'
}
$null = Invoke-RestMethod -Uri $WbUri -Method Post -Headers $WbHeaders `
    -ContentType 'application/json' -TimeoutSec 15 `
    -Body '{"jsonrpc":"2.0","method":"notifications/initialized"}'
```

Initialization returns server information. The notification returns HTTP
`202` with no body. No authorization or session token is required by this
server. Use the loopback address and selected port as shown.

## 2. Discover tools and read their results

`tools/list` supplies the exact argument schemas for this client build.
Follow `nextCursor` to read all pages:

```powershell
$cursor = $null
$WbTools = @()
do {
    $params = @{}
    if ($cursor) { $params.cursor = $cursor }
    $page = Invoke-WbRpc 'tools/list' $params
    $WbTools += $page.tools
    $cursor = $page.nextCursor
} while ($cursor)
$WbTools | Select-Object name, description

function Invoke-WbTool {
    param([string]$Name, [hashtable]$Arguments = @{})
    $result = Invoke-WbRpc 'tools/call' @{ name = $Name; arguments = $Arguments }
    if ($result.isError) {
        throw ($result | ConvertTo-Json -Depth 40 -Compress)
    }
    return $result.structuredContent
}

function Wait-WbOperation {
    param($Receipt)
    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    while ($Receipt.operationId -and $Receipt.status -eq 'queued') {
        if ([DateTime]::UtcNow -ge $deadline) {
            throw "Still pending: $($Receipt.operationId). Inspect it before retrying."
        }
        Start-Sleep -Milliseconds ([Math]::Max(50, [int]$Receipt.pollAfterMs))
        $Receipt = Invoke-WbTool 'wb_operation_get' @{
            operationId = $Receipt.operationId
        }
    }
    if ($Receipt.operationId) {
        if ($Receipt.status -ne 'completed') {
            throw ($Receipt | ConvertTo-Json -Depth 40 -Compress)
        }
        return $Receipt.result
    }
    return $Receipt
}

$state = Invoke-WbTool 'wb_get_state'
$state | ConvertTo-Json -Depth 10
```

Tool data lives in `result.structuredContent`; a failed tool sets
`result.isError`. Some reads also return queued operations, so pass their
receipts through `Wait-WbOperation`. Protocol errors instead use the
top-level `error` object, and invalid HTTP requests can fail before either.

## 3. Apply an edit and inspect it

Edits require `expectedRevision`, copied from current state as a **string**,
and a fresh `idempotencyKey`. This helper reads state before each new edit:

```powershell
function Set-WbViewport {
    param([hashtable]$Settings)
    $state = Invoke-WbTool 'wb_get_state'
    if (-not $state.offline -or -not $state.open -or -not $state.settled) {
        throw 'Open the offline editor and wait until it is idle'
    }
    $arguments = @{
        expectedRevision = $state.revision
        idempotencyKey = [guid]::NewGuid().ToString()
        settings = $Settings
    }
    $receipt = Invoke-WbTool 'wb_viewport_update' $arguments
    Wait-WbOperation $receipt
}

$before = Invoke-WbTool 'wb_viewport_get'
Set-WbViewport @{
    grid = $true
    gridMatchSnap = $true
    snapTranslate = $true
    snapTranslateStep = 0.5
}
Invoke-WbTool 'wb_viewport_get'
```

You should see a grid in the viewport. `effectiveGridStep` should be `0.5`,
and moving a selected object uses half-metre snapping. Showing the grid alone
does not enable snapping; this example enables both explicitly.

When you finish, restore the four values changed by the example:

```powershell
Set-WbViewport @{
    grid = $before.grid
    gridMatchSnap = $before.gridMatchSnap
    snapTranslate = $before.snapTranslate
    snapTranslateStep = $before.snapTranslateStep
}
```

## Request reference and retry rules

| Purpose | JSON-RPC method and parameters |
| --- | --- |
| Discover tools | `tools/list`, with `cursor` when supplied by the previous page. |
| Call a tool | `tools/call`, with `name` and an `arguments` object. |
| List readable resources | `resources/list`. |
| Read state as a resource | `resources/read`, with `uri: "worldbuilder://state"`. |
| Inspect queued work | Call `wb_operation_get` with `operationId`. |

The other resource URIs are `worldbuilder://project`,
`worldbuilder://selection`, `worldbuilder://capabilities` and
`worldbuilder://logs`. The project resource is metadata; use
`wb_document_get` for paginated scene collections.

Keep the request arguments and idempotency key if delivery is uncertain.
Retrying the exact same edit returns its retained operation. A different key
can apply the edit twice; reusing a key with changed arguments is rejected.
Receipts expire, so they are not permanent transaction records. The short
example stops on errors instead of automatically resending an edit.

For a stale revision, read current state and reconsider the edit. For a
pending operation, inspect or wait for it before starting another mutation.
`wb_operation_wait` is also an immediate poll, not a blocking wait.
`wb_operation_cancel` only cancels work that has not started. A batch stops
at its first failure and keeps earlier changes; it is not atomic.

Object handles belong to the running editor and level generation. Read them
again after a level change. A level load temporarily stops the listener;
reconnect and check readiness afterwards. Do not store these handles in a
project or treat an HTTP `200` as proof an edit or level load finished.

For viewport captures, preserve the full `tools/call` result: PNG image
blocks are in `content`, which the convenience helper above discards. Poll
`wb_capture_viewport` with its `captureId`, rather than an operation ID.

See the [MCP HTTP transport specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
for the compatibility protocol's message and header rules, and the
[MCP guide](../../world/world-builder-mcp/) for file access and capabilities.
