---
title: Handle an item's native inventory action
description: Replace a local inventory use action and send a validated request to the server for custom behavior.
sidebar:
  label: Inventory use
  order: 79
---

Use `Inventory.onUse` in a client resource to replace an item's built-in action with
your own interaction. It works with ordinary and custom items.

```ts
const handler = Inventory.onUse("apple", (use) => {
  Hud.showNotification(`Selected one apple from row ${use.id}.`);
  Events.emitServer("my-food:use", JSON.stringify({ id: use.id, revision: use.revision }));
});

// When your override is no longer wanted:
// Inventory.offUse(handler);
```

This suppresses the native action. The sample does not consume the apple or
feed the player; implement the matching server handler before using it as a
food system. For ordinary food rules, the server
[consumption events](../../players/consumables/) are usually simpler.

## Select an item

| Selector | Matches |
| --- | --- |
| Exact catalog name, such as `apple` | All instances of that class. |
| Class GUID | All instances of that class. |
| Custom registration ID or logical GUID | Instances of a registered custom type. |
| `{ uid: "..." }` | One native instance on this client. |

Keep a UID as a decimal string so JavaScript does not lose its 64-bit value. This ID
identifies a native item instance, not a server inventory row. It can change when
items split, merge, or are recreated on the client. Use a class selector if the
override should keep working through those changes.

Unknown classes throw. Ordinary catalog classes can be registered when the resource
loads. If the server registers a custom definition before the player joins, install
its client handler in `playerReady`, after the definition arrives. For types
registered later, wait until the definition is available before installing the
handler.

## Read the callback

| Field | Meaning |
| --- | --- |
| `item` | Class GUID; the logical GUID for a custom type. |
| `uid` | Native instance ID as a string. |
| `id` | Current server inventory row ID. |
| `revision` | Inventory revision at interception. |
| `amount` | Always 1, even for a stack. |
| `action` | `primary`, `secondary`, or `activate`. |

Primary use is available even for items without a normal use action. Secondary use
covers Eat/Drink and Learn. The `activate` action includes double-clicking a custom
item. Native weapon-slot and food-pouch double-click behavior, and quickslot actions
outside inventory, keep their existing behavior.

Handlers run on the next feature update. A removed handler, missing item or
changed revision discards the pending use. Repeated presses on the same
instance in one frame produce one callback; the queue holds at most 16 uses.

Returning false, throwing, or waiting for a promise does not resume vanilla
use. No consumption, animation or stat change happens automatically.
`playerItemUsed` is not raised for the suppressed action. On a custom item,
this also replaces the automatic `playerCustomItemUse` server request.

## Validate the server action

Validate the request on the server before spending inventory. Use the sending player
supplied by `Events.onClient`, then check the current row, class, quantity, revision
and your gameplay conditions. Never trust a player ID or an effect amount supplied in
the payload. See [Server and client events](../../core-concepts/networking/).

For an action that consumes a unit, pass the revision to `Inventory.remove` and grant
its effect only when `result.ok` is true. Inventory may change while an animation
plays, making that revision stale. If removal fails, do not award the effect. Private
custom metadata remains on the server.

## Remove an override

`onUse` returns a numeric registration ID. `offUse(id)` removes a handler owned by the
calling resource and reports whether it existed. Instance handlers take priority over
class handlers. If several handlers use the same selector, only the newest runs.
Removing it lets the previous handler run again. At most 256 handlers may be active.
Resource stop and session end remove handlers and pending actions.

## Related

- [Custom inventory items](../../players/custom-items/)
- [Inventory reference](../../reference/client/variables/Inventory.md)
