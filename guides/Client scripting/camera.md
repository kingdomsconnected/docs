---
title: Camera and free camera (noclip)
description: Read where this client's camera is and what it points at, and take it over with NoClip to fly, spectate or frame a shot.
sidebar:
  label: Camera and noclip
  order: 72
---

[`Camera`](../../reference/client/variables/Camera.md) reads the view this
client is drawing through. [`NoClip`](../../reference/client/variables/NoClip.md)
takes that view over and flies it through the world, walls included: an admin
fly mode, a spectator camera or a scripted shot.

```ts
Key.bind("f8", () => {
  if (NoClip.isActive()) {
    NoClip.disable();
  } else {
    NoClip.enable({ mode: "body", speed: 12 });
  }
});
```

## Read the camera pose

`Camera.getPose()` returns a [CameraPose](../../reference/client/interfaces/CameraPose.md):
the eye `position`, the unit vectors `forward`, `right` and `up` (roll
included), the vertical `fov` in degrees and the `aspectRatio`.

It is whichever camera the game has now: behind the player, in a dialogue, in a
cutscene or in a free flight. `Camera` cannot move it; only `NoClip` can.

## Aim through a point on screen

`Camera.screenRay({ x, y, range })` returns a
[CameraRay](../../reference/client/interfaces/CameraRay.md): `origin` (the eye),
a unit `direction`, and `target` (`origin` plus `direction` times `range`).

- `x` and `y` run from -1 (left, bottom) to +1 (right, top). The default
  `(0, 0)` is the crosshair. From a web view, divide pixels by the screen size.
- `range` is 100 metres by default and at most 4096.

```ts
const ray = Camera.screenRay({ range: 40 });
const hit = ray ? World.raycast(ray.origin, ray.target, { mode: "anything" }) : null;
```

[Raycasts and nearby entities](../../world/raycasts/) covers what `World.raycast`
returns.

:::caution
`getPose` and `screenRay` return `null` in the main menu and across a level
load, when there is no active view.
:::

## Free camera modes

With the defaults, the player flies with the photo mode keys (forward, back,
left, right, jump to rise, crouch to sink, fast movement to boost), holds Alt to
crawl and turns with the mouse. The keys follow the Controls menu and the
keyboard layout. It is the same camera the F7 map editor flies.

| `mode` | What happens to the body |
| --- | --- |
| `body` (default) | travels with the camera through geometry, the world streams in around it, and it lands where the flight ends |
| `camera` | stays where it stood; only the view moves |

:::caution[Other players see a body flight]
In `body` mode the flown entity is the one this client replicates, so everyone
watches the player fly through walls. The server neither grants nor refuses
NoClip. If flying is an admin privilege, have the server tell the client when
it may enable it, and see [Server vs client authority](../../core-concepts/authority/).
:::

## Start and stop the free camera

`enable(options?)` returns a string:

| Result | Meaning |
| --- | --- |
| `enabled` | the flight started |
| `alreadyActive` | one was already running; the new options are not applied |
| `noCamera` | there is no level to put the camera in |
| `cameraBusy` | the F7 map editor holds the camera |

| Option | Meaning |
| --- | --- |
| `mode` | `body` or `camera`, see above |
| `input` | whether this machine's keyboard and mouse fly it (default `true`) |
| `speed` | metres a second, 0.05 to 400 (default 12) |
| `fov` | degrees, up to 140; left out, the game's own is kept |

`disable({ keepPosition })` ends the flight. By default the body stays where
the camera stopped; `keepPosition: false` puts it back where it took off,
facing the same way. In `camera` mode neither matters.

The game's controls are held during the flight, so the character does not walk.
Your [key binds](../input/) still fire, so a bind can turn the flight off.

## Know when the flight ends

A flight can end without your resource asking. `noclipChanged` reports every
start and end:

```ts
Events.on("noclipChanged", (active, reason) => {
  if (!active && reason !== "script") {
    Hud.showInfoText(`Free camera ended (${reason}).`);
  }
});
```

| `reason` | Cause |
| --- | --- |
| `script` | a resource started or ended it |
| `mapEditor` | F7 took the camera |
| `viewLost` | the level went away |
| `sessionOver` | the session ended |

:::caution
A flight is not cleaned up when the resource that started it stops. End it
yourself:

```ts
Events.on("resourceStop", (name) => {
  if (name === "my-mode" && NoClip.isActive()) {
    NoClip.disable({ keepPosition: false });
  }
});
```
:::

## Move the free camera from code

While a flight runs you can place and aim the camera. Every setter returns
`false` when no flight is running.

```ts
function frame(target: Vector3): void {
  if (NoClip.enable({ mode: "camera", input: false }) !== "cameraBusy") {
    NoClip.focus(target, 8); // face it, then stand 8 m back
  }
}
```

| Call | Does |
| --- | --- |
| `setPosition(position)`, `getPosition()` | place or read the camera |
| `setRotation({ yaw, pitch })`, `getRotation()` | degrees; yaw wraps to -180 to 180 (0 faces +Y, rising yaw turns left), pitch is clamped to -89 to 89 |
| `setPose(position, forward)`, `lookAt(point)`, `focus(target, distance?)` | place and aim in one call |
| `getForward()` | the view direction |
| `setSpeed()`, `getSpeed()` | flight speed, kept across flights |
| `setFov()`, `getFov()` | field of view |
| `getState()` | everything as one [NoClipState](../../reference/client/interfaces/NoClipState.md), read on the same frame, or `null` |

## Drive the free camera yourself

With `input: false` (or `setInputEnabled(false)` mid-flight), the keyboard
stops flying the camera and you call `move(input, deltaSeconds)` each frame:

```ts
let last = Date.now();

const timer = setInterval(() => {
  const now = Date.now();
  const delta = (now - last) / 1000;
  last = now;
  NoClip.move({ strafe: 1, yaw: 20 * delta }, delta); // a slow orbit
}, 16);

// When the shot is over: clearInterval(timer); NoClip.disable();
```

- `forward`, `strafe` and `lift` run from -1 to 1 along the heading, its right
  and world up. `yaw` and `pitch` are this frame's turn in degrees.
- `boost` multiplies the speed by six; `crawl` divides it by five.
- A frame longer than 0.1 seconds counts as 0.1, so a stall does not launch
  the camera across the map.
- `move` returns `false` while the built-in driver has the camera.

## Aim through the free camera

`rayThroughScreen(x, y)` gives the world direction through a point of the
frame, and `projectToScreen(point)` does the reverse, in the same -1 to 1
coordinates as `Camera.screenRay`:

```ts
function pickUnderCentre(): WorldRayHit | null {
  const from = NoClip.getPosition();
  const direction = NoClip.rayThroughScreen(0, 0);
  if (!from || !direction) {
    return null;
  }
  const to = from.clone().add(direction.clone().mul(200));
  return World.raycast(from, to, { mode: "anything" });
}
```

`Camera.getPose()` keeps working during a flight, since the free camera is the
game's active view while it runs.

## Related

- [Raycasts and nearby entities](../../world/raycasts/), for what a ray hits
- [Key binds and controls](../input/), to toggle the flight
- [Let players place objects](../placement/), which does its own aiming
- [Positions, rotations and vectors](../../core-concepts/math/)
