---
title: Light the world with point lights
description: Spawn point lights that every nearby player sees, or that only one player sees, and set their color, intensity, radius and shadows.
sidebar:
  label: Lights
  order: 45.5
---

A point light illuminates the surfaces around it: a lantern over a market
stall, a fire glow in a camp, a cold light in a crypt. A server script spawns
one for every nearby player; a client script spawns one that only that
player sees.

```ts
// A warm lantern glow over a stall, casting shadows.
const lantern = Light.spawn(new Vector3(3102.5, 818.0, 59.5), {
  color: new Vector3(1, 0.65, 0.3),
  intensity: 2,
  radius: 6,
  castShadows: true,
});
console.log(`${lantern}`);
```

A point light shines the same way in every direction, so it has no rotation
and no scale.

## Spawn a light

[`Light.spawn(position, options?)`](../../reference/server/classes/Light.md#spawn)
takes a position in metres and returns the light. Players within 250 m
receive it, including players who arrive later. Every option is optional:

| Option | Meaning | Default |
| --- | --- | --- |
| `color` | RGB, each component from 0 to 1, as a `Vector3` or `{ x, y, z }`. | Warm orange, `(1, 0.65, 0.3)`. |
| `intensity` | Diffuse multiplier from 0 to 100. `0` gives no light. | `1` |
| `radius` | How far the light reaches, in metres, from 0.1 to 100. | `5` |
| `castShadows` | Whether nearby objects cast shadows from it. Only a boolean is accepted. | `false` |

`position` and `color` take a `Vector3` or a plain `{ x, y, z }` object, not
an array. A light starts in the global virtual world, which every player
sees; `light.setVirtualWorld(world)` moves it, as for any entity. See
[Virtual worlds](../../core-concepts/virtual-worlds/).

## Change or remove a light

`position`, `color`, `intensity`, `radius` and `castShadows` are writable, and
an assignment reaches every player who has the light. A value out of range,
not finite or of the wrong type throws, and the light keeps its old value.

```ts
const light = Light.spawn(player.position, { radius: 8 });

light.color = new Vector3(0.4, 0.6, 1); // a cold blue
light.intensity = 0;                    // dark, but still there
light.castShadows = false;
light.destroy();                        // gone for every player; safe to repeat
```

## Who owns a light

A light a script spawns belongs to that resource: it is removed when the
resource stops. Lights in a World Builder export belong to the server, stay
when scripts stop, and are listed in that export's
[`WorldResource.lights`](../world-resources/). Nothing is saved: spawn
scripted lights again when the server starts.

## A light only one player sees

A client script's `Light.spawn` takes the same position and options and
creates a light on that machine only. Spawn it once the player is in the
world, which `playerReady` announces; check `LocalPlayer?.ready` too, so a
resource started after arrival creates its light at once.

```ts
// client
let glow: Light | null = null;

function lightUp(): void {
  if (!LocalPlayer?.ready || glow?.valid) return;
  glow = Light.spawn(new Vector3(3102.5, 818.0, 59.5), { color: new Vector3(0.6, 1, 0.6), radius: 4 });
}

Events.on("playerReady", lightUp);
lightUp();
```

A client [`Light`](../../reference/client/classes/Light.md) has the same
writable properties and `destroy()`, plus:

| Member | Meaning |
| --- | --- |
| `id` | This machine's own handle for the light. It is not a network id; never send it to the server. |
| `valid` | `false` once the light is gone: destroyed, its resource stopped or failed, or the session or world ended. |

## Shadows and the light budget

Each client draws at most 192 of these lights at once, counting World Builder,
server and client-script lights together. Past that, a client
`Light.spawn` throws and a server light is not drawn on that client.
`castShadows` asks for shadows; whether a player sees them also depends on
their shadow quality setting and the game's own light budget. Turn shadows on
only for the lights that need them.

## From World Builder

The World Builder's **Lights** tab places the same lights: **Add light in
front of camera**, then move it with the gizmo and set its color, intensity,
radius and **Cast shadows**. An export stores them in its `lights` array, and
the server spawns them in the global world when it starts:

```json
{
  "lights": [
    { "position": [3102.5, 818.0, 59.5], "color": [1, 0.65, 0.3], "intensity": 2, "radius": 6, "castShadows": true }
  ]
}
```

See [Create maps with World Builder](../world-builder/) for exporting, and
[Use World Builder exports in scripts](../world-resources/) for finding the
lights from a script.

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Light.spawn` (both sides) | The position is not finite, an option is out of range or of the wrong type, or `options` is not an object. | **Throws.** |
| Client `Light.spawn` | No world is loaded, 192 lights are already drawn, or the game refused to create it. | **Throws.** |
| Assigning a property | Out of range, not finite, or `castShadows` not a boolean. | **Throws**; the light is unchanged. |
| `destroy()` | Already destroyed. | Nothing; safe to repeat. |

## Related

- [Spawn props and objects](../props/), the meshes a light shines on
- [Particle effects](../effects/), fire and smoke to go with a glow
- [Time of day and weather](../clock-and-weather/), night falls on the server's clock
- [Light reference (server)](../../reference/server/classes/Light.md) and [Light reference (client)](../../reference/client/classes/Light.md)
