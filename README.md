# DragonWarriorJS - A recreation of Dragon Warrior for the NES in TypeScript
![Build](https://github.com/bobbylight/DragonWarriorJS/actions/workflows/build.yml/badge.svg)
![CodeQL](https://github.com/bobbylight/DragonWarriorJS/actions/workflows/codeql-analysis.yml/badge.svg)

Like it says on the tin.  This reproduction will try to be as authentic as
possible, warts and all.

What's (mostly) done:

* Map loading, motion, moving in and out of towns
* Collision detection
* Conversations with NPCs
* Sound (uses WebAudio, so Firefox and Chrome only for now)

What's currently being worked on (half-baked):

* Staying overnight at an inn
* Buying goods from a shop
* Battling an enemy

# To test this out

```bash
npm install
npm run watch
# View http://localhost:8080
```

# Editing the Map Data
In theory, once the engine is done, this game is mostly data-driven.
Most of the data is in map files.

[Tiled](https://www.mapeditor.org/) is used to create the maps for this game.
The actual data files live in `src/tiled`.  There is one `.tmx` file per map
in the game, including the overworld.  Please be sure to use the latest
version of `Tiled` when editing these files, as the XML schema of the `.tmx`
file format changes over time.  The game is currently being built using 1.8.4.

All maps follow the same conventions and structure.  Layers include:

* `tileLayer` - The actual map graphics.  Constitutes most of what you see.
* `tileLayer2` (optional) - A second layer of tiles.  Used for the inside
  of buildings with roofs in towns.  Where there are roofed buildings,
  `tileLayer` will render the roof tile, and `tileLayer2` will render the
  inside of the building.  This layer is omitted when it is not needed.
* `collisionLayer` - Dictates which tiles are solid and which aren't.
  This layer is currently used for both `tileLayer` and `tileLayer2`.
  Solid tiles can be rendered with the `collision` tileset by entering
  a debug key combination in the game.
* `warpLayer` - A layer containing objects of `type` `warp`.  `warp`s are
  used to travel from map to map, and require the following custom
  properties:
  * `map` - The map to warp to
  * `row` - The row at which to place the hero
  * `col` - The column at which to place the hero
  * `dir` (optional) - The direction the hero should face.  Should be one
    of `north`, `east`, `south`, or `west`
* `npcLayer` - A layer containing objects of `type` `npc`, `talkAcross`
  and `door`.
  * `npc` objects should have the following custom properties:
    * `type` - One of the values in [NpcType.ts](src/app/dw/NpcType.ts).
    Case is ignored.  The `name` property of each `npc` is used as a lookup
    for the NPC's conversation (see below).
    * `wanders` - Either `true` or `false`, depending on whether you want the
    NPC to move
    * `dir` (optional) - The direction the hero should initially face.  Should
    be one of `north`, `east`, `south`, or `west`.  Note you don't usually
    need to set this unless `wanders` is `false`.
  * `talkAcross` is an object type in `npcLayer` used to mark solid tiles the
    hero should be able to talk over, such as tables to chat with a merchant.
    Objects of type `talkAcross` currently have no custom properties.
  * The `door` object type denotes a door that can be opened, e.g. with a key.
    They have the following custom properties:
    * `replacementTileIndex` - The tile that should replace the door tile once
      the door has been opened.
* `enemyTerritoryLayer` (optional) - If defined, this layer describes enemy
  groups.  A non-empty tile type denotes an enemy group that the hero may
  randomly fight when stepping in it.  If this layer does not exist, no
  random battles occur in the map (e.g. in towns).

The Tiled project lives in `src/res/maps`. All data is stored in `.json` files
instead of `.tmx` for simplicity.

# Editing NPC Conversations
NPC's as defined in `npcLayer` above have their conversations defined in "map
logic" files that live in
[src/app/dw/mapLogic](src/app/dw/mapLogic).
There is one map logic file per map.  They all follow the same pattern.  Essentially, an object maps
each `npc`'s `name` property to a generator function that returns the
[NpcText](src/app/dw/mapLogic/MapLogic.ts#L33)
(i.e., the conversation that NPC will have with the hero) for that NPC. This function is passed the
`game` instance so that it can dynamically return different values depending on how far along the
player is.

The `NpcText` itself can be simple or complex, depending on how complex the NPC's conversation
with the hero should be. Essentially, it can be:

* A string, in which case the NPC says just that. This is the simple case
* An array of strings, in which case each string is rendered, but the user
  has to press a key to advance the conversation between each string
* An array containing a mixture of strings and
  [ConversationSegmentArgs](src/app/dw/ConversationSegment.ts#L23), which allow for
  logic in a conversation (question/answer, give/take money, etc.).  This type
  of conversation data is not well doc'd yet and is best observed by example
  in the source. It's essentially a grab-bag of optional fields that are each
  used in certain conditions.
  * Note that `ConversationSegmentArgs` can denote a "special" conversation type,
    as described by the `conversationType` property.  If this property is defined, it
    must currently be set to either `innkeeper` or `merchant`. In these cases, the
    logic for staying at an inn or purchasing items is automatically applied.

