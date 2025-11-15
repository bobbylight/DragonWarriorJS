import { TiledObject } from 'gtp';
import { getProperty } from 'gtp/lib/tiled/TiledPropertiesContainer';
import { PartyMember } from './PartyMember';
import { Direction } from './Direction';

/**
 * The hero is the main party member.
 */
export class Hero extends PartyMember {

    static stepInc = 0;

    /**
     * Overridden to check for warps and other interesting things we can
     * intersect on the map.
     */
    override handleIntersectedObject(obj: TiledObject) {
        if ('warp' === obj.type) {
            const newRow: number = parseInt(getProperty(obj, 'row'), 10);
            const newCol: number = parseInt(getProperty(obj, 'col'), 10);
            const newDir: number = Direction.fromString(getProperty(obj, 'dir', 'SOUTH'));
            this.game.loadMap(getProperty(obj, 'map'), newRow, newCol, newDir);
        } else if ('insideOutside' === obj.type) {
            this.game.setInsideOutside(getProperty(obj, 'inside') === 'true');
        }
    }
}
