---
title: Time of day and weather
description: Read and set the shared game clock, the sky preset, rain and wind that every client follows.
sidebar:
  label: Time and weather
  order: 40
---

Set the time of day, the sky, rain and wind once on the server, and every
client follows. All of it lives on the
[`World`](../../reference/server/variables/World.md) global.

```ts title="src/server/index.ts"
// A permanent summer afternoon.
World.setHour(15);
World.setTimeScale(0);
World.setWeather("cloudless_sunny");
World.setRain(0);
```

A fresh server starts at day 0, 08:00, running at 15 game seconds per real
second. There is nothing to configure in `server.json`. A joining client adopts
the server's day and hour, whatever its own save says.

## Read the clock and the sky

Every value is a read-only property. Change them with the `set*` methods below.

| Property | What it holds |
| --- | --- |
| `day` | Whole days since the level's midnight. Starts at 0 and only grows. |
| `hour` | Hour of the day, `0` up to but not including `24`. `13.5` is half past one. |
| `timeScale` | Game seconds per real second. `15` is the game's own pace, `0` is stopped. |
| `weather` | The preset the sky is blending towards (or sitting on). |
| `previousWeather` | The preset it is blending from. Same as `weather` once settled. |
| `weatherBlending`, `weatherRemaining` | Whether a blend is running, and how many game seconds it has left. |
| `rainIntensity`, `rainAmount` | How hard it rains and how much of it is drawn, each `0` to `1`. |
| `wind`, `windSpeed` | Wind velocity in m/s (a `Vector3`), and its length. |
| `wetness`, `puddles` | How soaked the ground is (`0` to `3`) and puddle cover (`0` to `1`). Derived from rain history. |

```ts
const hh = Math.floor(World.hour);
const mm = Math.floor((World.hour - hh) * 60);
Chat.sendToPlayer(player, `Day ${World.day}, ${hh}:${String(mm).padStart(2, "0")}, ${World.weather}`);
```

## Set the time

```ts
World.setHour(6);          // the next 06:00, today or tomorrow
World.setTime(120, 21.5);  // day 120 at 21:30, for restoring a saved clock
World.setTimeScale(60);    // four times the game's pace
```

The clock never runs backwards, because clients cannot be wound back cleanly.
`setHour` winds forward to the next time it is that hour. `setTime` takes an
absolute day and refuses a moment already behind the clock.

`setTimeScale` takes `0` to `200`. `0` freezes the clock, which is how you get
a fixed time of day.

:::note[The clock does not persist]
A restart boots at day 0 again. For a persistent calendar, save `World.day` and
`World.hour` yourself and pass them to `setTime` on start. At its ceiling
(about ten years of game days) the server sets `timeScale` to `0` on its own.
:::

## Change the weather

Weather is one of the game's time-of-day presets, blended over some number of
**game** seconds (at the default scale of 15, `120` is eight real seconds).
Omit the duration and the sky changes at once.

```ts
World.setWeather("cloudless_sunny", 600);
```

Only one blend runs at a time: `setWeather` returns `false` while one is going.
Check `World.weatherBlending` first, or retry after `weatherRemaining` game
seconds.

:::caution[Unknown presets are not caught]
The server cannot tell a real preset from a typo. An unknown name is accepted,
and every client keeps its sky and logs an error. Test the names you ship.
:::

## Set rain and wind

Rain is separate from the preset, so an overcast sky can stay dry.
`setRain(intensity, amount?)` takes `0` to `1` for both; `amount` defaults to
`1`. The ground soaks and dries on its own (drying is far slower), which is
what `wetness` and `puddles` report.

Wind is a world-space velocity in m/s, capped at 50. It bends trees, drags
cloth and slants the rain. There is no blend for wind, so ramp a gust yourself:

```ts
// Calm to a strong westerly over ten seconds.
let step = 0;
const gust = setInterval(() => {
  step += 1;
  World.setWind({ x: 1.5 * step, y: 0, z: 0 });
  if (step >= 10) clearInterval(gust);
}, 1000);
```

## React to a new day or weather

| Event | Arguments | When |
| --- | --- | --- |
| `worldDayChange` | `day` | The clock crossed midnight, by running or by a `setTime` jump. `day` is the one that began. |
| `worldWeatherChange` | `preset`, `previous`, `seconds` | A blend **started**. It does not fire again when the sky settles. |

```ts
Events.on("worldDayChange", (day) => {
  Chat.sendToAll(`Dawn of day ${day}.`);
});

Events.on("worldWeatherChange", (preset, previous, seconds) => {
  console.log(`sky: ${previous} -> ${preset} over ${seconds}s`);
});
```

## When a call fails

No setter throws or clamps. Each returns `true` when it took the value and
`false` otherwise, so check it when the input came from a player.

| Call | Returns `false` when |
| --- | --- |
| `setTime(day, hour)` | The moment is past, `day` is not whole, or `hour` is outside `0` to `24`. |
| `setHour(hour)` | `hour` is outside `0` to `24`. |
| `setTimeScale(scale)` | `scale` is outside `0` to `200`. |
| `setWeather(preset, seconds?)` | A blend is running, or `seconds` is outside `0` to `21600`. |
| `setRain(intensity, amount?)` | Either value is outside `0` to `1`. |
| `setWind(wind)` | A component is not a finite number, or the length is over 50. |

:::tip[Try it]
The default gamemode's `/world` command (`src/server/commands/world.ts`):
`/world hour 21`, `/world weather cloudless_sunny 120`, `/world rain 0.7`,
`/world wind 10 0`. `/world` alone prints the state.
:::

## Related

- [World reference](../../reference/server/variables/World.md), every property and setter
- [Events](../../core-concepts/events/), how `Events.on` handlers work
- [Positions, rotations and vectors](../../core-concepts/math/), for the wind vector's axes
- [Particle effects](../effects/), to add smoke or fire to a scene
