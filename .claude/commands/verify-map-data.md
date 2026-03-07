# Verify Map Data

Validate the game's map JSON files (generated in an external tool - Tiled) for correctness.

## Arguments

`$ARGUMENTS` may be empty or contain a comma-separated list of map base names (without the `.json`
extension), e.g. `kol` or `kol,garinham`.

- If `$ARGUMENTS` is **empty**, validate **all** maps.
- If `$ARGUMENTS` is **non-empty**, split on commas, trim whitespace, and validate **only** those
  maps (e.g. `kol` → `public/res/maps/kol.json`). Skip any names that don't match an existing map
  file and note them in the output.

## General Notes

If any single map file has too many tokens to be read in one go with the Read tool, or any other tool,
try to read it with offset/limit or some other means of pagination to validate the entire file if possible.

## Steps

1. **Discover map JSON files** in `public/res/maps/` using Glob. Exclude tileset/utility files
   (`tileset_tiles.json`, `collision_tiles.json`, `enemy_territory_tiles.json`, and any file without
   a `logicFile` property). Then apply the argument filter described above.

2. **For each map JSON file**:
   - Read the file and find the `logicFile` property in the top-level `properties` array
   - If no `logicFile` property exists, skip the map with a note
   - Confirm the corresponding `.ts` file exists at `src/app/dw/mapLogic/{logicFile}.ts`
   - Read the TypeScript logic file

3. **Check: Collision layer**
   - Verify that the map has a `collisionLayer` layer with a `type` property set to `tilelayer`.

4. **Check: Warp layer**
    - Verify that the map has a `warpLayer` layer with a `type` property set to `objectgroup`.
    - For all objects in the `objects` array, do the following:
      - Verify they have `x`, `y`, `width`, and `height` properties that are all multiple of 16
      - If the object has `"type": "warp"`, verify the following:
        - Verify it has a `properties` array with the following properties (additional ones are OK, but
          should be noted in the output):
          - `col` is a REQUIRED property of type `string` with a value being a stringified number
          - `row` is a REQUIRED property of type `string` with a value being a stringified number
          - `map` is a REQUIRED property of type `string` with a value being the base name of a map JSON file in this
            project
          - `dir` is an OPTIONAL property of type `string` with a value being `NORTH`, `EAST`, `SOUTH`, or `WEST`,
            ignoring case
      - If the object has `"type": "insideOutside"`, verify the following:
        - Verify it has a `properties` array with the following properties (additional ones are OK, but
          should be noted in the output):
          - `inside` is a REQUIRED property of type `string` or `boolean` with a value being either `true` or `false`
      - If the object does not have a `type`, or its type is not one of `warp` or `insideOutside`, note it by name and
        type

5. **Check: NPC layer**
   - Check whether map has a `npcLayer` layer. If it doesn't, skip the rest of this check
   - Verify its `type` property is set to `objectgroup`
   - Verify all NPCs have dialogue defined by doing the following:
     - Collect all NPC names from the `objects` array where `"type": "npc"` (exclude
       `"talkAcross"`, `"door"`, `"chest"`, and other non-npc types)
     - Collect all keys from the `talks` object in the corresponding TypeScript file
     - Report any NPC names present in the map but missing from `talks`
   - Verify all objects from the `objects` array with `"type: "door"` have a `properties` array with
     the following entries:
     - `replacementTileIndex` with an integer value > 0 or a string representation of an integer value > 0
   - Verify ALL objects in the `objects` array have the following:
     - An `x` property that's an integer and a multiple of 16
     - A `y` property that's an integer and a multiple of 16
     - A `width` property that's an integer and a multiple of 16
     - A `height` property that's an integer and a multiple of 16
   - Report any object in `objects` that is not one of the following values for `type`:
     - `npc`, `door`, `talkAcross`, `chest`

6. **Check: Hidden Item layer**
   - Check whether map has a `hiddenItemLayer` layer. If it doesn't, skip the rest of this check
   - Verify its `type` property is set to `objectgroup`
   - Verify all objects in the `objects` array have the following:
     - A non-empty `name` string property
     - An `x` property that's an integer and a multiple of 16
     - A `y` property that's an integer and a multiple of 16
     - A `width` property that's an integer and a multiple of 16
     - A `height` property that's an integer and a multiple of 16
     - A `type` property that is set to `item`
     - A `properties` array with the following entries:
       - An entry with name `item`, type `string`, and value `herb`

7. ** Check: Additional map properties**
   - Verify that the map has a `music` property with a string value from the `Sounds` type in
     `src/app/dw/Sounds.ts`.

8. **Report results** grouped by map:
   - Map JSON filename
   - `logicFile` value and whether the `.ts` file exists
   - Any of the checks above that failed, with enough detail to identify them in the JSON.

Print the results in a summary table/list at the end.
