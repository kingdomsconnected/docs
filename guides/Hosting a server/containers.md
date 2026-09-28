---
title: Docker, Pterodactyl and Fly.io
description: Run the official Linux server image with Docker or Compose, give it a built gamemode, and host it on Fly.io or a Pterodactyl panel.
sidebar:
  label: Docker and panels
  order: 104
---

Every release publishes a Linux amd64 image,
`ghcr.io/kingdomsconnected/kcdc-server:<version>`, where `<version>` is the
release number without the `v` (for example `1.3.4`). There is no `latest`
tag. One command runs it:

```sh title="Host"
docker run -d --name kcdc --init --restart unless-stopped \
  -p 27015:27015/udp -p 27016:27016/tcp \
  -v kcdc-data:/home/container 'ghcr.io/kingdomsconnected/kcdc-server:1.3.4'
docker logs -f kcdc
```

Everything the server writes (`server.json`, logs, crash data, `.packages/`,
`resources/`) lives in `/home/container`. On a named volume it survives
upgrades: recreate the container with the new tag. The server runs as UID and
GID `10001`, so a bind-mounted directory must be writable by that user.

Publishing the ports is not enough on its own: open them in the host or cloud
firewall too ([Let players connect](../players-connecting/#make-your-server-reachable)).

## Add the built gamemode

On every start, the entrypoint copies the default gamemode into
`resources/kcdc-gamemode` **only if that folder does not exist**. The copy is
TypeScript source with no `dist/` and no `ui/` (the F4 debug panel), and the
image has no Node.js to build it. So a fresh container accepts players but
runs no gamemode until you copy a built one in:

1. On your own machine, build the gamemode from the release
   ([Install and run a server](../../getting-started/install/)). You now have
   `server/resources/kcdc-gamemode/` with `dist/` and `ui/`.
2. Copy both folders in and restart:

   ```sh title="Host, in the release's server/ folder"
   docker cp resources/kcdc-gamemode/dist kcdc:/home/container/resources/kcdc-gamemode/
   docker cp resources/kcdc-gamemode/ui kcdc:/home/container/resources/kcdc-gamemode/
   docker restart kcdc
   ```

3. Check the log for the gamemode's `ready with ... commands` line.

Your own resources go the same way: `docker cp` the built folder into
`/home/container/resources/`, then restart, or use `refresh` and `start` in
the [console](#use-the-console).

## Compose

Save this as `compose.yaml`, with a `.env` beside it holding
`KCDC_VERSION=1.3.4`:

```yaml title="compose.yaml"
services:
  server:
    image: ${KCDC_IMAGE:-ghcr.io/kingdomsconnected/kcdc-server}:${KCDC_VERSION:?Set KCDC_VERSION to a released version}
    platform: linux/amd64
    restart: unless-stopped
    init: true
    ports:
      - "27015:27015/udp"
      - "27016:27016/tcp"
    volumes:
      - server-data:/home/container
    stop_grace_period: 30s

volumes:
  server-data:
```

```sh title="Host, next to compose.yaml"
docker compose pull
docker compose up -d
docker compose logs -f server
```

`KCDC_VERSION` and the optional `KCDC_IMAGE` only pick the image; server
settings come from `server.json` in the volume or from arguments.

To edit resources on the host, mount a folder over `resources/`. The
entrypoint seeds the source gamemode there too if it is missing, so put your
built `kcdc-gamemode` in first:

```yaml title="compose.yaml (service excerpt)"
    volumes:
      - server-data:/home/container
      - ./resources:/home/container/resources
```

## Change the ports

Anything after the image name goes to the server, so the
[command-line arguments](../run-a-server/#command-line-arguments) work
unchanged. Change a port and its mapping together:

```sh title="Host"
docker run -d --name kcdc --init --restart unless-stopped \
  -p 28015:28015/udp -p 28016:28016/tcp \
  -v kcdc-data:/home/container 'ghcr.io/kingdomsconnected/kcdc-server:1.3.4' \
  --port 28015 --apiport 28016
```

In Compose, set the service's `command` and `ports`:

```yaml title="compose.yaml (service excerpt)"
    command: ["--port", "28015", "--apiport", "28016"]
    ports:
      - "28015:28015/udp"
      - "28016:28016/tcp"
```

## Use the console

A detached container has no stdin, so typed [console
commands](../run-a-server/#console-commands) go nowhere. Start it with
`-it` and attach:

```sh title="Host"
docker run -dit --name kcdc --init --restart unless-stopped \
  -p 27015:27015/udp -p 27016:27016/tcp \
  -v kcdc-data:/home/container 'ghcr.io/kingdomsconnected/kcdc-server:1.3.4'
docker attach kcdc
```

In Compose, add `stdin_open: true` and `tty: true` to the service, then
`docker compose attach server`. Detach with **Ctrl+P** then **Ctrl+Q**;
**Ctrl+C** shuts the server down. Without a console, `docker restart kcdc`
picks up every resource change but disconnects everyone.

## Fly.io

Deploy with the `fly.toml` from the mod's repository, whose process command
passes Fly's UDP bind address as `--host`. UDP on Fly needs a dedicated IPv4:

```sh title="Host"
fly ips allocate-v4
fly deploy --image ghcr.io/kingdomsconnected/kcdc-server:1.3.4
```

That `fly.toml` mounts no volume, so `/home/container` starts empty whenever
the machine is recreated. Add a Fly volume at `/home/container`, or build an
image that carries your built gamemode (with `dist/` and `ui/`) in place of
the seeded source:

```dockerfile title="Dockerfile"
FROM ghcr.io/kingdomsconnected/kcdc-server:1.3.4
COPY kcdc-gamemode/ /opt/kcdc/default-resources/kcdc-gamemode/
```

The entrypoint seeds from there, so this image also works for Docker and
Compose on a fresh volume.

## Pterodactyl

The image follows Pterodactyl's conventions (user `container`, home
`/home/container`, Wings' `STARTUP` variable), and each release embeds a
matching egg. Extract it:

```sh title="Host with Docker"
IMAGE='ghcr.io/kingdomsconnected/kcdc-server:1.3.4'
docker pull "$IMAGE"
CONTAINER=$(docker create "$IMAGE")
docker cp "$CONTAINER:/usr/share/kcdc/egg-kcdc.json" ./egg-kcdc.json
docker rm -v "$CONTAINER"
```

1. In the Panel's admin area, create a **KCDC** nest and **Import Egg**
   `egg-kcdc.json` into it.
2. On the node, add two free ports, for example 27015 (game) and 27016 (HTTP).
3. Create a server from the egg, with the game port as primary allocation
   and the HTTP port as an additional one.
4. Set the egg's **HTTP port** variable to the additional allocation. The two
   must differ; the variable alone does not allocate a port.
5. Start the server and wait for `KCDC Server successfully started`.
6. Upload your built `dist/` and `ui/` into `resources/kcdc-gamemode/` with
   the file manager or SFTP ([Add the built gamemode](#add-the-built-gamemode)),
   then restart.

The egg's startup command sets bind addresses and ports, overriding those
keys in `server.json`. Everything else, including `mod` and `server-token`,
is yours to edit; keep the token in the file, not the egg, since eggs get
shared. The console tab writes to stdin, so console commands work as typed.

To upgrade: stop the server, back up its files (hidden ones included),
import the new release's egg, select the new image tag on the server, and
start it. No reinstall is needed.

## Related

- [Run a dedicated server](../run-a-server/): ports, arguments and console commands.
- [server.json settings](../server-json/): level and required DLCs.
- [Server browser listing](../server-browser/): list the container's server.
- [Let players connect](../players-connecting/): firewalls and the player checklist.
