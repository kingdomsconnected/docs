---
title: Time of day and weather
description: Read and set the shared game clock, the sky preset, rain and wind that every client follows.
sidebar:
  order: 40
---

The server owns one clock and one sky, and every connected client follows
them. A client that joins adopts the server's day and hour, whatever its own
save says, so you set the time and weather once on the server and everybody
sees the same thing. All of it lives on the [`World`](../../../reference/server/variables/World.md)
global.

There is nothing to configure in `server.json`. A fresh server starts at day 0,
08:00, running at 15 game seconds per real second, and stays there until a
script changes it.

```ts title="src/server/index.ts"
// A permanent summer afternoon.
World.setHour(15);
World.setTimeScale(0);
World.setWeather("cloudless_sunny");
World.setRain(0);
```

## Reading the clock and the sky

Everything is a read-only property. Writes go through the `set*` methods below.

| Property | What it holds |
| --- | --- |
| `day` | Whole days since the level's midnight. Starts at 0 and only grows. |
| `hour` | Hour of the day, `0` up to but not including `24`. `13.5` is half past one. |
| `timeScale` | Game seconds per real second. `15` is the game's own pace, `0` is stopped. |
| `weather` | The time-of-day preset the sky is blending towards (or sitting on). |
| `previousWeather` | The preset it is blending from. Same as `weather` once settled. |
| `weatherBlending`, `weatherRemaining` | Whether a blend is running, and how many game seconds it has left. |
| `rainIntensity`, `rainAmount` | How hard it rains and how much of it is drawn, each `0` to `1`. |
| `wind`, `windSpeed` | Wind velocity in m/s (a `Vector3`), and its length. |
| `wetness`, `puddles` | How soaked the ground is (`0` to `3`) and puddle cover (`0` to `1`). Derived from the rain history, so read-only. |

```ts
const hh = Math.floor(World.hour);
const mm = Math.floor((World.hour - hh) * 60);
Chat.sendToPlayer(player, `Day ${World.day}, ${hh}:${String(mm).padStart(2, "0")}, ${World.weather}`);
```

## Moving the clock

```ts
World.setHour(6);          // the next 06:00, today or tomorrow
World.setTime(120, 21.5);  // day 120 at 21:30, for restoring a saved clock
World.setTimeScale(60);    // four times the game's pace
```

The clock never runs backwards. `setHour` always winds forward to the next time
it is that hour, rolling into tomorrow if today's has passed. `setTime` takes an
absolute day and refuses a moment that is already behind the clock. That is a
deliberate constraint: clients cannot be wound back cleanly, so the server
never asks them to.

`setTimeScale` takes `0` to `200`. `0` freezes the clock where it stands, which
is how you get a fixed time of day.

:::note
The server clock does not survive a server restart: it boots at day 0 again.
If your gamemode wants a persistent calendar, save `World.day` and
`World.hour` yourself and pass them to `setTime` on start. The clock also has
a ceiling (about ten years of game days); when it reaches it, the server drops
`timeScale` to `0` on its own.
:::

## Weather

Weather is one of the game's own time-of-day presets, blended to over some
number of **game** seconds (so at the default scale of 15, `120` is eight real
seconds). Omit the duration and the sky changes at once.

```ts
World.setWeather("cloudless_sunny", 600);
```

Only one blend runs at a time. `setWeather` returns `false` while one is still
going, because a half-finished blend has no single preset to leave from. Check
`World.weatherBlending` first, or retry after `weatherRemaining` game seconds.

:::caution[Unknown presets are not caught here]
The server has no copy of the game's preset table, so it cannot tell a real
name from a typo. A name the game does not know is accepted, and every client
leaves its sky where it was and logs an error. Test the names you ship.
:::

Rain is separate from the preset: an overcast sky can stay dry, and a sunny
one can rain. `setRain(intensity, amount?)` takes `0` to `1` for both, and
`amount` defaults to `1`. The ground soaks and dries on its own from the rain
history (it dries far slower than it soaks), which is what `wetness` and
`puddles` report.

Wind is a velocity in metres per second, in world space, capped at 50 m/s. It
bends trees, drags cloth and slants the rain. There is no blend for wind: the
engine takes a vector and holds it, so a gust is something you ramp yourself.

```ts
// Ramp from calm to a strong westerly over ten seconds.
let step = 0;
const gust = setInterval(() => {
  step += 1;
  World.setWind({ x: 1.5 * step, y: 0, z: 0 });
  if (step >= 10) clearInterval(gust);
}, 1000);
```

## Events

| Event | Arguments | When |
| --- | --- | --- |
| `worldDayChange` | `day` | The clock crossed midnight, by running or by a `setTime` jump. `day` is the one that just began. |
| `worldWeatherChange` | `preset`, `previous`, `seconds` | A blend **started**. It does not fire again when the sky settles. |

```ts
Events.on("worldDayChange", (day) => {
  Chat.sendToAll(`Dawn of day ${day}.`);
});

Events.on("worldWeatherChange", (preset, previous, seconds) => {
  console.log(`sky: ${previous} -> ${preset} over ${seconds}s`);
});
```

## What fails, and how

None of these throw. Every setter returns `true` when it took the value and
`false` when it did not, and nothing is clamped into range:

| Call | Returns `false` when |
| --- | --- |
| `setTime(day, hour)` | The moment is already past, `day` is not whole, or `hour` is outside `0` to `24`. |
| `setHour(hour)` | `hour` is outside `0` to `24`. |
| `setTimeScale(scale)` | `scale` is outside `0` to `200`. |
| `setWeather(preset, seconds?)` | A blend is still running, or `seconds` is outside `0` to `21600`. |
| `setRain(intensity, amount?)` | Either value is outside `0` to `1`. |
| `setWind(wind)` | A component is not a finite number, or the length is over 50. |

So check the return value when the input came from a player.

:::tip[Try it]
The default gamemode's `/world` command (`src/server/commands/world.ts`) calls
every one of these: `/world hour 21`, `/world weather cloudless_sunny 120`,
`/world rain 0.7`, `/world wind 10 0`. `/world` alone prints the state.
:::
