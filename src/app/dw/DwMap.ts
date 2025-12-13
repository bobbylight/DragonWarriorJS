import { TiledMap, TiledMapArgs, TiledMapData } from 'gtp';
import { Npc } from './Npc';
import { Door } from './Door';
import { Chest } from './Chest';
import { LocationString } from './LocationString';
import { HiddenItem } from './HiddenItem';

export class DwMap extends TiledMap {

    readonly npcs: Npc[];
    readonly talkAcrosses: Map<LocationString, boolean>;
    readonly doors: Door[];
    readonly chests: Map<LocationString, Chest>;
    readonly hiddenItems: Map<LocationString, HiddenItem>;

    constructor(public name: string, data: TiledMapData, args: TiledMapArgs) {
        super(data, args);
        this.npcs = [];
        this.talkAcrosses = new Map();
        this.doors = [];
        this.chests = new Map();
        this.hiddenItems = new Map();
    }

    removeChest(chest: Chest) {
        this.chests.delete(chest.location);
    }

    removeHiddenItem(item: HiddenItem) {
        this.hiddenItems.delete(item.location);
    }
}
