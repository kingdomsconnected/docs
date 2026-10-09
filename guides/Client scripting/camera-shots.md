---
title: Frame a scripted camera shot
description: Cut or glide to a fixed camera position, then return the player to their normal view.
sidebar:
  label: Scripted camera shots
  order: 72.1
---

`Camera.setShot` holds a view at a world position and looks at a second point.
Use it for an introduction, conversation or scene.

```ts
const me = LocalPlayer;
if (me) {
  const target = me.position.clone().add(new Vector3(0, 0, 1.5));
  Camera.setShot({
    position: target.clone().add(new Vector3(4, -4, 2)),
    lookAt: target,
    duration: 1200,
    fov: 55,
  });
}
Key.bind("f8", "down", () => Camera.clearShot(800));
```

Run this example in a client script. The camera looks at the player's position when
the script runs; it does not follow them as they walk away. Press **F8** to return to
the normal view. The shot does not move the player or disable their controls. Use
`Controls` if the scene should prevent movement.

## Set the transition

| Option | Meaning |
| --- | --- |
| `position` | Required camera position as a `Vector3`. |
| `lookAt` | Required point to face, different from `position`. |
| `duration` | Transition time in milliseconds, 0 to 60000; 0 cuts immediately. |
| `fov` | Vertical field of view, 20 to 120 degrees; omitted keeps the player's setting. |

`duration` sets how long the transition takes. The camera stays at the shot until
`clearShot`, another `setShot`, or the end of the session. A second shot starts its
transition from the current view. `clearShot(duration)` glides back toward the
player's current view even if they moved in the meantime.

`Camera.isShotActive()` becomes false as soon as the return begins, including
while the return glide is still visible. The client's `setShot` returns false
if NoClip is flying or the two points coincide.

## Direct one player's view from the server

```ts
// server
function introduce(player: Player): void {
  const target = player.position.clone().add(new Vector3(0, 0, 1.5));
  Camera.setShot(player, {
    position: target.clone().add(new Vector3(4, -4, 2)),
    lookAt: target,
    duration: 1000,
  });
}

Events.on("playerCommand", (player, command) => {
  if (command === "endintro") Camera.clearShot(player, 800);
});
```

The server return value tells you whether the request was sent; the client can still
refuse it. The server does not save the shot. Reconnecting or changing level restores
the normal view until another instruction is sent. Server and client shots share one
camera; the last request wins.

## Share the camera with other screens

A shot overrides third-person camera mode, which resumes afterward. NoClip
cannot start while a shot holds the view. Inventory, map and pause screens
temporarily use their own camera; closing them resumes the shot. The player's
head is drawn while viewed from outside their eyes.

End the shot when your resource's scene ends or the resource stops. Avoid
clearing another resource's shot: coordinate camera ownership in your game
mode when multiple resources can direct it.

## Related

- [Camera and noclip](../camera/)
- [Scripted scenes](../../tutorials/scripted-scene/)
- [Camera reference](../../reference/client/variables/Camera.md)
