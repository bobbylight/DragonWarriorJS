import PartyMember from './PartyMember';
import { TiledObject } from 'gtp';
import Direction from './Direction';

/**
 * The hero is the main party member.
 */
export default class Hero extends PartyMember {

    static STEP_INC: number = 0;

    constructor(args: any) {
        super(args);
    }

    /**
     * Overridden to check for warps and other interesting things we can
     * intersect on the map.
     */
    handleIntersectedObject(obj: TiledObject) {
        if ('warp' === obj.type) {
            const newRow: number = parseInt(obj.propertiesByName.row.value, 10);
            const newCol: number = parseInt(obj.propertiesByName.col.value, 10);
            const newDir: number = Direction.fromString(obj.getProperty('dir')!);
            this.game.loadMap(obj.getProperty('map')!, newRow, newCol, newDir);
        } else if ('insideOutside' === obj.type) {
            this.game.setInsideOutside(obj.getProperty('inside') as string === 'true');
        }
    }
}
