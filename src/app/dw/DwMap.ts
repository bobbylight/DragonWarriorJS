import { TiledMap } from 'gtp';
import Npc from './Npc';
import Door from './Door';
import { Chest } from './Chest';
import { LocationString } from './LocationString';
import { TiledMapData } from 'gtp/lib/tiled/TiledMapData';
import { TiledMapArgs } from 'gtp/lib/tiled/TiledMapArgs';

export default class DwMap extends TiledMap {

    npcs: Npc[];
    talkAcrosses: { [ key: string ]: boolean }
    doors: Door[];
    chests: Map<LocationString, Chest>;

    constructor(public name: string, data: TiledMapData, args: TiledMapArgs) {
        super(data, args);
    }

    removeChest(chest: Chest) {
        this.chests.delete(chest.location);
    }
}
