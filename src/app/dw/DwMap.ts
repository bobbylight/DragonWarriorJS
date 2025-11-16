import { TiledMap } from 'gtp';
import { TiledMapData } from 'gtp/lib/tiled/TiledMapData';
import { TiledMapArgs } from 'gtp/lib/tiled/TiledMapArgs';
import { Npc } from './Npc';
import { Door } from './Door';
import { Chest } from './Chest';
import { LocationString } from './LocationString';

export class DwMap extends TiledMap {

    readonly npcs: Npc[];
    readonly talkAcrosses: Map<LocationString, boolean>;
    readonly doors: Door[];
    readonly chests: Map<LocationString, Chest>;

    constructor(public name: string, data: TiledMapData, args: TiledMapArgs) {
        super(data, args);
        this.npcs = [];
        this.talkAcrosses = new Map();
        this.doors = [];
        this.chests = new Map();
    }

    removeChest(chest: Chest) {
        this.chests.delete(chest.location);
    }
}
