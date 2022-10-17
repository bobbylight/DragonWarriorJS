import Direction from './Direction';
import DwGame from './DwGame';
import Hero from './Hero';
import { TiledLayer } from 'gtp';

export default class RoamingEntity {

    protected game: DwGame;
    name: string;
    direction: number;
    mapRow: number;
    mapCol: number;
    xOffs: number;
    yOffs: number;
    protected _stepTick: number;
    private _moveInc: number;
    protected range: number[];

    constructor(args?: any) {
        this.game = (window as any).game as DwGame;
        this.direction = this.direction || Direction.SOUTH;
        this.mapCol = this.mapCol || 0;
        this.mapRow = this.mapRow || 0;
        this.xOffs = this.xOffs || 0;
        this.yOffs = this.yOffs || 0;
        this._stepTick = 0;
        // TODO: Make this time-dependent!
        this._moveInc = this.game.scale * (this.game.targetFps === 30 ? 2 : 1);
    }

    getMoveIncrement() {
        return this._moveInc;
    }

    handleIsMovingInUpdate() {
        if (this.isMoving()) {
            if (this.xOffs < 0) {
                this.xOffs += this.getMoveIncrement();
            } else if (this.xOffs > 0) {
                this.xOffs -= this.getMoveIncrement();
            } else if (this.yOffs < 0) {
                this.yOffs += this.getMoveIncrement();
            } else if (this.yOffs > 0) {
                this.yOffs -= this.getMoveIncrement();
            }
            if (!this.isMoving()) {
                this.handlePostMove();
            }

        }
    }

    handlePostMove() {
        // Do nothing; subclasses can override
    }

    /**
     * Returns whether this entity is at the specified row and column in the
     * map.
     *
     * @param row The row.
     * @param col The column.
     * @return Whether this entity is at that row and column.
     */
    isAt(row: number, col: number) {
        return this.mapRow === row && this.mapCol === col;
    }

    isMoving() {
        return this.xOffs !== 0 || this.yOffs !== 0;
    }

    /**
     * If this entity is only allowed to walk around in a certain range, this
     * method returns true iff the specified location is outside that range.
     */
    private _isOutOfRange(row: number, col: number) {
        if (this.range) {
            return col < this.range[0] || col > this.range[2] ||
                row < this.range[1] || row > this.range[3];
        }
        return false;
    }

    setMapLocation(row: number, col: number) {
        if (this.mapRow != null && this.mapCol != null) {
            const layer: TiledLayer = this.game.getCollisionLayer();
            layer.setData(this.mapRow, this.mapCol, 0);
            if (row > -1 && col > -1) { // row===-1 && col===-1 => don't display
                layer.setData(row, col, 1);
            }
        }
        this.mapRow = row;
        this.mapCol = col;
        this.xOffs = this.yOffs = 0;
    }

    /**
     * Call this with care.
     */
    setMoveIncrement(moveInc: number) {
        moveInc = Math.max(0, moveInc);
        this._moveInc = moveInc;
    }

    /**
     * Tries to move the player onto the specified tile.
     *
     * @param row The row to attempt to move to.
     * @param col The column to attempt to move to.
     * @return Whether the move was successful.
     */
    private _tryToMove(row: number, col: number) {

        if (this._isOutOfRange(row, col)) {
            return false;
        }

        const data: number = this.game.getCollisionLayer().getData(row, col);
        const canWalk: boolean = data === 0; // -1;
        if (canWalk) {
            this.setMapLocation(row, col);
        }

        // TODO: Is there a better way to determine that I'm the hero?
        else if (data === 361 && this.constructor === Hero) { // i.e., not an NPC
            (this as Hero).game.bump();
        }
        /*
        else {
           console.log("Can't walk (" + row + ", " + col + "): " + data);
        }
        */
        return canWalk;
    }

    tryToMoveLeft() {
        let success: boolean = false;
        let col: number = this.mapCol - 1;
        if (col < 0) {
            col += this.game.map.width;
        }
        if (this._tryToMove(this.mapRow, col)) {
            this.xOffs = this.game.getTileSize();
            success = true;
        }
        this.direction = Direction.WEST;
        return success;
    }

    tryToMoveRight() {
        let success: boolean = false;
        const col: number = Math.floor((this.mapCol + 1) % this.game.map.width);
        if (this._tryToMove(this.mapRow, col)) {
            this.xOffs = -this.game.getTileSize();
            success = true;
        }
        this.direction = Direction.EAST;
        return success;
    }

    tryToMoveUp() {
        let success: boolean = false;
        let row: number = this.mapRow - 1;
        if (row < 0) {
            row += this.game.map.height;
        }
        if (this._tryToMove(row, this.mapCol)) {
            this.yOffs += this.game.getTileSize();
            success = true;
        }
        this.direction = Direction.NORTH;
        return success;
    }

    tryToMoveDown() {
        let success: boolean = false;
        const row: number = Math.floor((this.mapRow + 1) % this.game.map.height);
        if (this._tryToMove(row, this.mapCol)) {
            this.yOffs -= this.game.getTileSize();
            success = true;
        }
        this.direction = Direction.SOUTH;
        return success;
    }
}
