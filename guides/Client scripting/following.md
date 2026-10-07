---
title: Let the player follow an NPC or another player
description: Start and stop the local player's native follow action, check pending requests and respond to interruption.
sidebar:
  label: Following players and NPCs
  order: 71.5
---

The client-side `Follow` API moves the local player using the game's walking
or riding follow action. Use it for an NPC guide or for travelling together.

```ts
Key.bind("f8", "down", () => {
  if (Follow.getTarget() || Follow.isPending()) {
    Follow.stop();
    return;
  }
  const target = Follow.targets().find(candidate => Follow.canStart(candidate));
  if (target) Follow.start(target);
});
```

This controls the player whose client runs the script. To make an NPC follow
someone, use the server's [`npc.follow`](../../npcs-and-animals/npc-orders/).

## Choose a target

`Follow.targets()` lists streamed players and human NPCs within 20 metres.
Each `FollowTarget` has a network `id`, `kind` (`player` or `npc`), `name`
and `position`. Names and positions are snapshots; the API resolves the ID
again when used. Animals are not follow targets.

Use `Follow.canStart(target)` to check native restrictions. Being in the
list alone does not mean the game's starting distance, combat, interaction
or mount requirements allow following. Both `canStart` and `start` also
accept a client `Player` handle.

## Wait for confirmation

`Follow.start(target)` returns true when queued, and false when refused.
`Follow.isPending()` reports a queued request. `Follow.getTarget()` returns
the active target, or null while idle or pending.

```ts
Events.on("followStarted", (target) => {
  Hud.showInfoText(`Following ${target.name}`);
});
Events.on("followStopped", (target, reason) => {
  console.log(`Stopped following ${target.name}: ${reason}`);
});
```

A queued request can fail and raise `followStopped` without ever raising
`followStarted`. Only one scripted follow can be pending or active.

## Let the player stop

`Follow.stop()` cancels the calling resource's request, leaving another
resource's follow alone. Movement input, target loss, death or
unconsciousness, mount changes, large position jumps and separation beyond
40 metres also end following. Stopping the owner resource or ending the
session releases it automatically.

The stop event reports `script`, `input`, `targetLost`, `mountChanged`,
`teleported`, `unavailable`, `interrupted`, `failed`, `resourceStopped`,
`sessionEnded` or `worldChanged`. Let the player choose to start again after
an interruption; continually restarting it would fight their controls.

## Use the game's Follow hint

The default game mode offers a Follow hint when looking at an eligible
player or NPC, and a Stop following hint while active. It uses the game's
`chat_focus_follow_init` control and respects rebinding. That hint is
sample game-mode behavior; `Follow` itself does not draw it.

See [Action hints](../../user-interface/action-hints/) to build your own,
or [build an NPC walking tour](../../tutorials/world-builder-tour/) to
combine client following with a route authored in World Builder.
