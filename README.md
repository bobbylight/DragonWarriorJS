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
file format changes over time.  The game is currently being built using 1.2.4.

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

The `.tmx` files in `src/tiled` are the raw map data, but whenever changes
are made, the data is exported into JSON files in `src/res/maps`.  These JSON
files are what the game actually loads.  Note that each Tiled map is configured
to export tile data in CSV format, and that `Tiled` itself has the following
options set:  "Embed Tilesets" and "Resolve object types and properties".  This
allows the JSON files to be self-contained and contain relative paths to the
actual images used for tiles.

# Editing NPC Conversations
NPC's as defined in `npcLayer` above have their conversations defined in "map
logic" files that live in `src/app/dw/mapLogic`.  There is one map logic file
per map.  They all follow the same pattern.  Essentially, an object maps each
`npc`'s `name` property to a function that returns the conversation for that
NPC.  The function is called each time the hero talks to the NPC, and its return
value can be one of the following:

* A string, in which case the NPC always says the same thing
* An array of strings, in which case each string is rendered, but the user
  has to press a key to advance the conversation between each string
* An array containing a mixture of strings and
  [ConversationSegments](src/app/dw/ConversationSegment.ts), which allow for
  logic in a conversation (question/answer, give/take money, etc.).  This type
  of conversation data is not well doc'd yet and is best observed by example
  in the source (note I don't think the type definitions are quite right yet
  either).
* An object representing a "special" conversation type, as described by the
  `conversationType` property.  This property must currently be set to either
  `innkeeper` or `merchant`.  This type of conversation is essentially a
  configurable template for these common types of conversations.  Again, this is
  not currently well documented and is best learned by looking at the examples
  in the source code.
