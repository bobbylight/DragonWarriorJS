import { LocationString } from './LocationString';
import { Item } from './Item';

export type HiddenItemType = 'herb';

/**
 * Denotes a hidden item on the map. This is pulled from the "hiddenItemLayer" in the Tiled map data,
 * but is stored directly in the "DwMap" for simplicity.
 */
export interface HiddenItem {
    id: string;
    contentType: HiddenItemType;
    contents: Item;
    location: LocationString;
}
