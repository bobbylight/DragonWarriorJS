/**
 * The types of NPCs defined in the game's Tiled map files.
 */
export type NpcType =
    | 'SOLDIER_GRAY'
    | 'SOLDIER_RED'
    | 'MAN_BLUE'
    | 'WOMAN_BLUE'
    | 'MERCHANT_GREEN'
    | 'OLD_MAN_GRAY'
    | 'KING';

/**
 * A mapping of NPC type to the row in the sprite sheet containing their graphics.
 */
const npcSpriteRows: Record<NpcType, number> = {
    SOLDIER_GRAY: 0,
    SOLDIER_RED: 1,
    MAN_BLUE: 2,
    WOMAN_BLUE: 3,
    MERCHANT_GREEN: 4,
    OLD_MAN_GRAY: 5,
    KING: 6,
};

/**
 * Returns the row in the NPC sprite sheet containing an NPC type's graphics.
 */
export const getNpcSpriteRow = (type: NpcType): number => npcSpriteRows[type];

const npcTypeSet = new Set<string>(Object.keys(npcSpriteRows));

/**
 * Returns the NPC type for a specified string. If this value is unknown, a default
 * value is returned.
 */
export const getNpcType = (type: string): NpcType => {
    const upper = type.toUpperCase();
    return npcTypeSet.has(upper) ? upper as NpcType : 'MERCHANT_GREEN';
};
