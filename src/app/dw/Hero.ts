import PartyMember from './PartyMember';
import { TiledObject } from 'gtp';
import Direction from './Direction';
import { getProperty } from 'gtp/lib/tiled/TiledPropertiesContainer';

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
            // TODO: Can we update gtp to avoid needing these non-null assertions?
            const newRow: number = parseInt(obj.propertiesByName.get('row')!.value, 10);
            const newCol: number = parseInt(obj.propertiesByName.get('col')!.value, 10);
            const newDir: number = Direction.fromString(obj.propertiesByName['dir']);
            this.game.loadMap(getProperty(obj, 'map'), newRow, newCol, newDir);
        } else if ('insideOutside' === obj.type) {
            this.game.setInsideOutside(getProperty(obj, 'inside') === 'true');
        }
    }
}
