import RoamingEntity from './RoamingEntity';
import Direction from './Direction';
import { Delay, SpriteSheet, Utils } from 'gtp';
import Hero from './Hero';

export default class Npc extends RoamingEntity {

    type: number;
    wanders: boolean;
    npcIndex: number;
    private _origMapRow: number;
    private _origMapCol: number;
    private _origDir: Direction;
    private _stepDelay: Delay;

    constructor(args: any) {
        super(args);
        Utils.mixin(args, this);

        this._origMapRow = this.mapRow;
        this._origMapCol = this.mapCol;
        this._origDir = this.direction;

        if (this.wanders) {
            this._stepDelay = new Delay({millis: 3000, minDelta: -500, maxDelta: 500});
            delete this.wanders;
        }

        //gtp.Utils.mixin(dw.RoamingEntityMixin.prototype, this);
        //dw.RoamingEntityMixin.call(this);
    }

    // TODO: Change NPC image to remove the need for this
    private _computeColumn() {
        switch (this.direction) {
            case Direction.NORTH:
                return 4;
            case Direction.EAST:
                return 2;
            default:
            case Direction.SOUTH:
                return 0;
            case Direction.WEST:
                return 6;
        }
    }

    update(delta: number) {

        if (this._stepDelay && this._stepDelay.update(delta)) {
            this._step();
            this._stepDelay.reset();
        } else {
            this.handleIsMovingInUpdate();
        }
    }

    render(ctx: CanvasRenderingContext2D) {

        const ss: SpriteSheet = this.game.assets.get('npcs');
        var ssRow = this.type;
        var ssCol = this._computeColumn();
        var x = this.mapCol * this.game.getTileSize();
        x -= this.game.getMapXOffs();
        x += this.xOffs;
        var y = this.mapRow * this.game.getTileSize();
        y -= this.game.getMapYOffs();
        y += this.yOffs;
        ssCol += Hero.STEP_INC;
        ss.drawSprite(ctx, x, y, ssRow, ssCol);
    }

    reset() {
        this.setMapLocation(this._origMapRow, this._origMapCol);
        this.direction = this._origDir;
        if (this._stepDelay) {
            this._stepDelay.reset();
        }
    }

    setNpcIndex(index: number) {
        this.npcIndex = index;
    }

    private _step() {
        var dirFuncs = [ this.tryToMoveUp, this.tryToMoveDown,
            this.tryToMoveRight, this.tryToMoveLeft ];
        var triedToMove;
        while (!triedToMove) {
            const newDir: number = Utils.randomInt(0, 4);
            dirFuncs[ newDir ].call(this);
            // TODO: Provide means, in map or elsewhere, to restrict an NPC to
            // a specific region on the map.
            triedToMove = true;
        }
    }
}
