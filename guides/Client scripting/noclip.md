---
title: Free camera (noclip)
description: Fly the camera, or the player with it, through the world with NoClip, and drive it from your own code.
sidebar:
  order: 74
---

[`NoClip`](../../reference/client/variables/NoClip.md) takes over this client's
camera and flies it through the world, walls included. Use it for an admin fly
mode, a spectator camera, or a scripted shot. It is the same camera the F7 map
editor flies.

```ts
Key.bind("f8", () => {
  if (NoClip.isActive()) {
    NoClip.disable();
  } else {
    NoClip.enable({ mode: "body", speed: 12 });
  }
});
```

With the defaults, the player flies with the keys the game's photo mode uses
(forward, back, left, right, jump to rise, crouch to sink, fast movement to
boost), hold Alt to crawl, and turn with the mouse. The keys follow the Controls
menu and the keyboard layout, so AZERTY works as it does in the game.

## Two modes

`mode` decides what happens to the player's body:

- `body` (default): the body travels with the camera. It passes through
  geometry, the world streams in around it, and it lands wherever the flight
  ends.
- `camera`: the body stays where it stood, and only the view moves.

:::caution[Other players see a body flight]
In `body` mode the thing being flown is the entity this client replicates, so
everyone else watches the player fly through walls. NoClip is client-only, and
nothing about it is an order other machines take: the server does not grant or
refuse it. If flying is an admin privilege in your mode, have the server tell
the client when it may enable it, and treat it as a convenience rather than a
security boundary.
:::

## Starting and stopping

`enable(options?)` returns a string rather than a boolean, because there are
several reasons it can refuse:

| Result | Meaning |
| --- | --- |
| `enabled` | the flight started |
| `alreadyActive` | one was already running; the new options are not applied |
| `noCamera` | there is no level to put the camera in |
| `cameraBusy` | the F7 map editor holds the camera |

The options are `mode`, `input` (whether this machine's keyboard and mouse fly
it, on by default), `speed` in metres a second (0.05 to 400, 12 by default) and
`fov` in degrees (up to 140; left out, the game's own is kept).

`disable({ keepPosition })` ends the flight. By default the body stays where
the camera stopped; `keepPosition: false` puts it back where it took off,
facing the way it was. In `camera` mode neither matters.

The game's controls are held for as long as the flight lasts, so the character
does not walk while the camera flies. Your [key binds](../input/) still fire,
which is what lets a bind turn the flight off again.

## Knowing when it ends

A flight can end without your resource asking: the player opens the map editor,
the level goes away under the camera, or the session ends. `noclipChanged`
reports every start and end:

```ts
Events.on("noclipChanged", (active, reason) => {
  if (!active && reason !== "script") {
    Hud.showInfoText(`Free camera ended (${reason}).`);
  }
});
```

`reason` is `script` when a resource started or ended it, `mapEditor` when F7
took the camera, `viewLost` when the level went away, and `sessionOver` when
the session ended.

:::caution
A flight is not cleaned up when the resource that started it stops. If your
resource can stop mid-flight, end it yourself:

```ts
Events.on("resourceStop", (name) => {
  if (name === "my-mode" && NoClip.isActive()) {
    NoClip.disable({ keepPosition: false });
  }
});
```
:::

## Moving the camera from code

While a flight runs, you can place and aim the camera directly. Every setter
returns `false` when no flight is running.

```ts
function frame(target: Vector3): void {
  if (NoClip.enable({ mode: "camera", input: false }) !== "cameraBusy") {
    NoClip.focus(target, 8); // face it, then stand 8 m back
  }
}
```

- `setPosition(position)`, `getPosition()`
- `setRotation({ yaw, pitch })`, `getRotation()`, in degrees. Yaw wraps to -180
  to 180 (0 faces +Y, rising yaw turns left); pitch is clamped to -89 to 89.
- `setPose(position, forward)`, `lookAt(point)`, `focus(target, distance?)`
- `getForward()`, `setSpeed()`, `getSpeed()`, `setFov()`, `getFov()`. The speed
  is kept across flights.
- `getState()` returns everything as one
  [NoClipState](../../reference/client/interfaces/NoClipState.md), read on the
  same frame, or `null`.

## Driving it yourself

With `input: false` (or `setInputEnabled(false)` mid-flight), the player's
keyboard stops flying the camera and your resource does it with
`move(input, deltaSeconds)`, one frame at a time:

```ts
let last = Date.now();

const timer = setInterval(() => {
  const now = Date.now();
  const delta = (now - last) / 1000;
  last = now;

  // A slow orbit: drift right while turning left.
  NoClip.move({ strafe: 1, yaw: 20 * delta }, delta);
}, 16);

// Later, when the shot is over:
// clearInterval(timer);
// NoClip.disable();
```

`forward`, `strafe` and `lift` run from -1 to 1 along the view's heading, its
right, and world up. `yaw` and `pitch` are this frame's turn in degrees.
`boost` multiplies the speed by six and `crawl` divides it by five. A frame
longer than 0.1 seconds counts as 0.1, so a stall does not launch the camera
across the map. `move` returns `false` while the built-in driver has the camera,
so the two never integrate the same frame.

## Aiming through the free camera

`rayThroughScreen(x, y)` gives the world direction through a point of the frame,
and `projectToScreen(point)` does the reverse, both in the same -1 to 1
coordinates as [Camera.screenRay](../camera/). Pair the first with
`World.raycast` from `getPosition()` to find what is under a point:

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

`Camera.getPose()` keeps working during a flight too, since NoClip's camera is
the game's active view while it runs.

## Related

- [Camera and raycasts](../camera/)
- [Key binds and controls](../input/)
