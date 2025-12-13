import { LocationString } from './LocationString';

// TODO: Can this be pulled from/match items somehow?
export type ChestContentType = 'gold' | 'magicKey';

/**
 * Denotes a treasure chest on the map. This is pulled from the "npcLayer" in the Tiled map data,
 * but is stored directly in the "DwMap" for simplicity.
 */
export interface Chest {
    id: string;
    contentType: ChestContentType;
    contents: number | (() => number);
    location: LocationString;
}
