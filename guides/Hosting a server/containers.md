---
title: Docker, Pterodactyl and Fly.io
description: Run the official Linux server image, get a built gamemode into it, and host it on Compose, Fly.io or a Pterodactyl panel.
sidebar:
  order: 102
---

Every release publishes a Linux amd64 image with the server in it:
`ghcr.io/kingdomsconnected/kcdc-server:<version>`, where `<version>` is the
release number without a leading `v` (for example `1.3.4`). There is no
`latest` tag; you always pick an exact release. The same image runs under
plain Docker, Compose, Fly.io and Pterodactyl.

## Run it

```sh title="Host"
docker run -d --name kcdc --init --restart unless-stopped \
  -p 27015:27015/udp -p 27016:27016/tcp \
  -v kcdc-data:/home/container 'ghcr.io/kingdomsconnected/kcdc-server:1.3.4'
docker logs -f kcdc
```

Everything the server writes lives in `/home/container`: `server.json`, logs,
crash data, the `.packages/` cache and `resources/`. Keep it on a named volume
and it survives upgrades; to upgrade, recreate the container with the new tag.

The server runs as UID and GID `10001`. A bind-mounted directory in place of
the volume must be writable by that user.

## What a fresh container runs

On every start, the image's entrypoint copies the default gamemode into
`resources/kcdc-gamemode` **if that folder does not exist yet**. An existing
folder, edited or emptied, is never touched again.

What it copies is the gamemode's TypeScript source, the same as a release
ships, with no `dist/`. The image has no Node.js or pnpm to compile it. So a
fresh container accepts players, but runs no gamemode and answers no
commands until you give it a built one.

:::caution[The seeded copy is incomplete]
The seeded folder also lacks `ui/`, the page behind the gamemode's F4 debug
panel. Building inside the container would not fix that, which is one more
reason to build on your own machine and copy the whole folder in.
:::

### Getting a built gamemode in

1. On your own machine, build the gamemode from the release, following [Run
   the default gamemode](../../getting-started/run-the-gamemode/) up to the end of the
   compile step. You now have `server/resources/kcdc-gamemode/` with `dist/`
   and `ui/` in it.
2. Copy the two folders into the running container and restart it:

   ```sh title="Host, in the release's server/ folder"
   docker cp resources/kcdc-gamemode/dist kcdc:/home/container/resources/kcdc-gamemode/
   docker cp resources/kcdc-gamemode/ui kcdc:/home/container/resources/kcdc-gamemode/
   docker restart kcdc
   ```

3. Check the log for the gamemode's `ready with ... commands` line.

Your own resources go the same way: build on your machine, `docker cp` the
resource folder into `/home/container/resources/`, then restart or use
[`refresh` and `start`](../console/#adding-a-resource-while-the-server-runs).

If you would rather edit resources on the host, mount a host folder over
`resources/` instead:

```yaml title="compose.yaml (service excerpt)"
    volumes:
      - server-data:/home/container
      - ./resources:/home/container/resources
```

The entrypoint seeds the source gamemode into that folder too, if it is
missing, so put your built `kcdc-gamemode` there first.

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

`KCDC_VERSION` and the optional `KCDC_IMAGE` only choose the image. Server
settings come from `server.json` in the volume or from arguments.

## Arguments and ports

Anything after the image name is passed to the server, so the
[command-line arguments](../dedicated-server/#command-line-arguments) work
unchanged. Change a port and its mapping together, so players reach the port
the server thinks it is on:

```sh title="Host"
docker run -d --name kcdc --init --restart unless-stopped \
  -p 28015:28015/udp -p 28016:28016/tcp \
  -v kcdc-data:/home/container 'ghcr.io/kingdomsconnected/kcdc-server:1.3.4' \
  --port 28015 --apiport 28016
```

In Compose, the same goes in the service's `command` and `ports`:

```yaml title="compose.yaml (service excerpt)"
    command: ["--port", "28015", "--apiport", "28016"]
    ports:
      - "28015:28015/udp"
      - "28016:28016/tcp"
```

The game port is UDP only. Open both ports in the host or cloud firewall as
well; publishing them in Docker is not enough on its own.

To type [console](../console/) verbs into a container, it needs stdin and a
terminal; the console page shows how.

## Fly.io

Deploy the image with the `fly.toml` from the mod's repository, whose process
command looks up Fly's UDP bind address and passes it as `--host`:

```sh title="Host"
fly ips allocate-v4
fly deploy --image ghcr.io/kingdomsconnected/kcdc-server:1.3.4
```

UDP on Fly needs a dedicated IPv4 address, hence the first command.

That `fly.toml` mounts no volume, so `/home/container`, including
`server.json` and `resources/`, starts empty whenever the machine is
recreated. Either add a Fly volume at `/home/container`, or build a small
image of your own on top of the official one that carries the built
gamemode in place of the seeded source:

```dockerfile title="Dockerfile"
FROM ghcr.io/kingdomsconnected/kcdc-server:1.3.4
COPY kcdc-gamemode/ /opt/kcdc/default-resources/kcdc-gamemode/
```

Here `kcdc-gamemode/` is your built copy, with `dist/` and `ui/`. The
entrypoint seeds it from there like the default, so this also works for
plain Docker and Compose on a fresh volume.

## Pterodactyl

The image follows Pterodactyl's conventions (user `container`, home at
`/home/container`, Wings' `STARTUP` variable), and each release embeds a
matching egg. Extract it without starting a server:

```sh title="Host with Docker"
IMAGE='ghcr.io/kingdomsconnected/kcdc-server:1.3.4'
docker pull "$IMAGE"
CONTAINER=$(docker create "$IMAGE")
docker cp "$CONTAINER:/usr/share/kcdc/egg-kcdc.json" ./egg-kcdc.json
docker rm -v "$CONTAINER"
```

1. In the Panel's admin area, create a **KCDC** nest and use **Import Egg**
   to upload `egg-kcdc.json` into it.
2. On the node, add two free ports: one for the game, one for HTTP (for
   example 27015 and 27016).
3. Create a server from the egg. Make the game port its primary allocation
   and the HTTP port an additional allocation.
4. Set the egg's **HTTP port** variable to that additional allocation. The
   two must differ. Changing the variable alone does not allocate a port.
5. Start the server and wait for `KCDC Server successfully started`.
6. Upload your built `dist/` and `ui/` into `resources/kcdc-gamemode/`
   through the file manager or SFTP, as in [Getting a built gamemode
   in](#getting-a-built-gamemode-in), and restart.

The egg's startup command sets the bind addresses and ports itself, so those
keys in `server.json` are overridden. Everything else in the file, including
`mod` and `server-token`, is yours to edit after the first start. Keep the
token in the file rather than in the egg, since eggs tend to get shared.

To upgrade: stop the server, back up its files (hidden ones included), import
the egg from the new release, select the new image tag on the server, and
start it. No reinstall is needed.
