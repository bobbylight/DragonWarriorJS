import { Delay, SpriteSheet, Utils } from 'gtp';
import {RoamingEntity, RoamingEntityArgs} from './RoamingEntity';
import { Direction } from './Direction';
import { Hero } from './Hero';
import { NpcType } from './NpcType';
import {DwGame} from "./DwGame";

type DirFunctionType = () => void;

export interface NpcArgs extends RoamingEntityArgs {
    type?: NpcType;
    wanders: boolean;
}

export class Npc extends RoamingEntity {

    type: NpcType;
    wanders: boolean;
    npcIndex: number;
    private readonly origMapRow: number;
    private readonly origMapCol: number;
    private readonly origDir: number;
    private readonly stepDelay: Delay;

    private readonly dirFuncs: DirFunctionType[];

    constructor(game: DwGame, args: NpcArgs) {
        super(game, args);
        this.type = args.type ?? NpcType.MERCHANT_GREEN;
        this.wanders = args.wanders;

        this.origMapRow = this.mapRow;
        this.origMapCol = this.mapCol;
        this.origDir = this.direction;

        if (this.wanders) {
            this.stepDelay = new Delay({millis: 3000, minDelta: -500, maxDelta: 500});
        }

        this.dirFuncs = [ this.tryToMoveUp.bind(this), this.tryToMoveDown.bind(this),
            this.tryToMoveRight.bind(this), this.tryToMoveLeft.bind(this) ];

        //gtp.Utils.mixin(RoamingEntityMixin.prototype, this);
        //RoamingEntityMixin.call(this);
    }

    // TODO: Change NPC image to remove the need for this
    private computeColumn() {
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

        if (this.stepDelay?.update(delta)) {
            this.step();
            this.stepDelay.reset();
        } else {
            this.handleIsMovingInUpdate();
        }
    }

    render(ctx: CanvasRenderingContext2D) {

        const ss: SpriteSheet = this.game.assets.get('npcs');
        const ssRow: number = this.type as number;
        let ssCol: number = this.computeColumn();
        let x: number = this.mapCol * this.game.getTileSize();
        x -= this.game.getMapXOffs();
        x += this.xOffs;
        let y: number = this.mapRow * this.game.getTileSize();
        y -= this.game.getMapYOffs();
        y += this.yOffs;
        ssCol += Hero.stepInc;
        ss.drawSprite(ctx, x, y, ssRow, ssCol);
    }

    reset() {
        this.setMapLocation(this.origMapRow, this.origMapCol);
        this.direction = this.origDir;
        if (this.stepDelay) {
            this.stepDelay.reset();
        }
    }

    setNpcIndex(index: number) {
        this.npcIndex = index;
    }

    private step() {
        let triedToMove = false;
        while (!triedToMove) {
            const newDir: number = Utils.randomInt(0, 4);
            this.dirFuncs[ newDir ].call(this);
            // TODO: Provide means, in map or elsewhere, to restrict an NPC to
            // a specific region on the map.
            triedToMove = true;
        }
    }
}
