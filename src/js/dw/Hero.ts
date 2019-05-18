import PartyMember from './PartyMember';
import { TiledObject } from 'gtp';
import Direction from './Direction';

/**
 * The hero is the main party member.
 * @constructor
 */
export default class Hero extends PartyMember {

    static STEP_INC: number = 0;

    constructor(args) {
        super(args);
    }

    /**
     * Overridden to check for warps and other interesting things we can
     * intersect on the map.
     */
    handleIntersectedObject(obj: TiledObject) {
        if ('warp' === obj.type) {
            var newRow = parseInt(obj.properties.row, 10);
            var newCol = parseInt(obj.properties.col, 10);
            var newDir = Direction.fromString(obj.properties.dir);
            this.game.loadMap(obj.properties.map, newRow, newCol, newDir);
        } else if ('insideOutside' === obj.type) {
            this.game.setInsideOutside(obj.properties.inside === 'true');
        }
    }
}
