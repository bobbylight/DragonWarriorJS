import { LocationString } from './LocationString';
import { Item } from "./Item";

export type HiddenItemType = 'herb';

export interface HiddenItem {
    id: string;
    contentType: HiddenItemType;
    contents: Item;
    location: LocationString;
}
