---
name: add-enemy
description: This skill should be used when the user wants to "add an enemy", "create a new enemy", "define a new enemy", "add a monster", or wants to introduce a new enemy type to the game.
---

# Adding a New Enemy

Adding an enemy requires updating up to four files. The sprite artwork must already exist in `public/res/monsters.png`
before starting — that step is done externally in an image editor.

## Files Involved

| File | Purpose |
|---|---|
| `public/res/enemyAtlas.json` | Maps image IDs to pixel coordinates in `monsters.png` |
| `public/res/enemies.json` | Enemy stat definitions (`EnemyData`) |
| `public/res/enemyTerritories.json` | Which overworld zones the enemy spawns in |
| `src/app/dw/EnemyAI.ts` | AI behavior functions (only if adding a new AI type) |

## Step 1: Register Sprites in `enemyAtlas.json`

Each enemy needs two entries: a normal image and a damaged image (shown when hit).

```json
{ "id": "MyEnemy",         "dim": "x,y,width,height" },
{ "id": "MyEnemy_damaged", "dim": "x,y,width,height" }
```

- `dim` is `"x,y,width,height"` in pixels within `monsters.png`
- Leave the placeholder `"x,y,width,height"` as-is and instruct the user to replace it with the actual bounding box
  coordinates from their image editor once the sprite is placed
- The damaged image may reuse another enemy's damaged image (e.g. Magidrakee reuses `Drakee_damaged`)

## Step 2: Add the Enemy Definition to `enemies.json`

The key is the enemy's internal ID (no spaces, PascalCase). Always append new enemies at the end of the JSON object. Use the `EnemyData` shape:

```json
"MyEnemy": {
  "name": "My Enemy",
  "shortName": "My Enemy",
  "image": "MyEnemy",
  "damagedImage": "MyEnemy_damaged",
  "str": 0,
  "agility": 0,
  "hp": 0,
  "resist": { "sleep": 0, "stopSpell": 0, "hurt": 0 },
  "dodge": 0,
  "xp": 0,
  "gp": 0,
  "ai": "attackOnly"
}
```

**Field notes:**
- `name`: Display name shown in battle (can include spaces)
- `shortName`: Optional shorter display name; omit if same as `name`
- `hp` and `gp`: Can be a single number or `[min, max]` array (both inclusive) for random range
- `resist`: Values are resistance percentages — `0` = no resistance, `15` = high resistance
- `dodge`: Dodge chance (higher = dodges more attacks)
- `ai`: Must match a key in `EnemyAI.ts` (see below)

## Step 3: Add to `enemyTerritories.json` (only if requested and if spawning on overworld)

This file is an array of zone arrays. Each zone lists which enemies can appear there. Zone indices correspond to the
colored territory regions on the overworld map.

Add the enemy's internal ID to the appropriate zone(s):

```json
[ "ExistingEnemy", "MyEnemy" ]
```

Omit this step entirely unless the user explicitly states they want to add an enemy to a zone/territory.

## Step 4: Add AI (only if needed)

The available AI functions are defined in `src/app/dw/EnemyAI.ts`. Existing options:

| AI key | Behavior |
|---|---|
| `attackOnly` | Always attacks physically |
| `halfHurtHalfAttack` | 50% HURT spell, 50% physical |
| `75Hurt25Attack` | 75% HURT spell, 25% physical |
| `drakeemaAi` | Heals when damaged, otherwise 50% HURT / 50% physical |

To add a new AI, register a new function in `EnemyAI.ts` following the same pattern:

```ts
aiMap.myEnemyAi = (hero: Hero, enemy: Enemy) => {
    // return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) }
    // return { type: 'magic', spellName: 'HURT', damage: enemy.computeHurtSpellDamage(hero) }
    // return { type: 'magic', spellName: 'HEAL', damage: 0 }
};
```

Always add new entries to `aiMap` after all the existing ones.

Add unit tests for any new AI in `src/app/dw/EnemyAI.spec.ts`. The unit tests should only test the behavior of the AI
function itself. Wrap all tests in a `describe` block with the name of the AI function.

The `ai` string in `enemies.json` must exactly match the key used in `aiMap`.

### How and when to add an AI:
* If the user doesn't ask to add an AI explicitly, default to `attackOnly` which is already defined.
  If you default to `attackOnly`, tell the user you are doing so in your summary output.
* If the user asks for a new AI, ensure they define it in simple logical terms you can convert into
  code, similar to the existing AIs. For example, "40% chance to cast HURT, otherwise physical attack."
  If their description of the AI is unclear to you, ask for clarification before implementing.
