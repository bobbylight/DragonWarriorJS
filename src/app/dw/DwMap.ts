import { TiledMap } from 'gtp';
import Npc from './Npc';
import Door from './Door';

export default class DwMap extends TiledMap {

    npcs: Npc[];
    talkAcrosses: boolean[];
    doors: Door[];
    chests: Map<string, number>; // TODO: Support more than just gold in chests
}
