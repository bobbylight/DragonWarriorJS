/**
 * Transitions from the map to a battle
 */
import { Image, State } from 'gtp';
import { BaseState } from './BaseState';
import { DwGame } from './DwGame';

export class BattleTransitionState extends BaseState {

    private readonly enteringState: State<DwGame>;
    private readonly enteringStateScreenshot: HTMLCanvasElement;
    state: number;
    tick: number;

    private static readonly TICK_COUNT: number = 25;

    constructor(game: DwGame, leavingState: BaseState, enteringState: BaseState) {
        super(game);
        this.enteringState = enteringState;
        this.enteringStateScreenshot = enteringState.createScreenshot();
    }

    override enter(game: DwGame) {
        super.enter(game);

        // TODO: Dynamically load scripts?
        //         var mapLogic = game.map.getProperty('logicFile');
        //         if (!game.hasLogic(mapLogic)) {
        //            game.assets
        //         }

        this.state = 0;
        this.tick = 0;
        game.audio.playMusic('MUSIC_BATTLE');

    }

    override render(ctx: CanvasRenderingContext2D) {

        this.game.drawMap(ctx);
        this.renderBattleBG(ctx);
    }

    private renderBattleBG(ctx: CanvasRenderingContext2D) {

        const game: DwGame = this.game;

        const w: number = game.getWidth();
        const h: number = game.getHeight();
        const tileSize: number = game.getTileSize();

        const cx: number = w / 2;
        const cy: number = h / 2 - tileSize; // Matches where battle bg is draw in BattleState
        const battleBG: Image = game.assets.get('battleBG');
        const xts: number = battleBG.width / 5;
        const yts: number = battleBG.height / 5;

        const x: number[] = [ cx - 2 * xts - xts / 2, cx - xts - xts / 2, cx - xts / 2, cx + xts / 2, cx + xts + xts / 2 ];
        const y: number[] = [ cy - 2 * yts - yts / 2, cy - yts - yts / 2, cy - yts / 2, cy + yts / 2, cy + yts + xts / 2 ];

        switch (this.state) {

            case 25:
                ctx.drawImage(this.enteringStateScreenshot, x[0], y[0], x[4] + xts - x[0], y[4] + yts - y[0],
                    x[0], y[0], x[4] + xts - x[0], y[4] + yts - y[0]);
                break;
            case 24:
                ctx.drawImage(this.enteringStateScreenshot, x[4], y[1], x[4] + xts - x[4], y[2] - y[1],
                    x[4], y[1], x[4] + xts - x[4], y[2] - y[1]);
            /* falls through */
            case 23:
                ctx.drawImage(this.enteringStateScreenshot, x[4], y[2], x[4] + xts - x[4], y[3] - y[2],
                    x[4], y[2], x[4] + xts - x[4], y[3] - y[2]);
            /* falls through */
            case 22:
                ctx.drawImage(this.enteringStateScreenshot, x[4], y[3], x[4] + xts - x[4], y[4] - y[3],
                    x[4], y[3], x[4] + xts - x[4], y[4] - y[3]);
            /* falls through */
            case 21:
                ctx.drawImage(this.enteringStateScreenshot, x[4], y[4], x[4] + xts - x[4], y[4] + yts - y[4],
                    x[4], y[4], x[4] + xts - x[4], y[4] + yts - y[4]);
            /* falls through */
            case 20:
                ctx.drawImage(this.enteringStateScreenshot, x[0], y[0], x[4] - x[0], y[4] + yts - y[0],
                    x[0], y[0], x[4] - x[0], y[4] + yts - y[0]);
                break;
            case 19:
                ctx.drawImage(this.enteringStateScreenshot, x[2], y[4], x[3] - x[2], y[4] + yts - y[4],
                    x[2], y[4], x[3] - x[2], y[4] + yts - y[4]);
            /* falls through */
            case 18:
                ctx.drawImage(this.enteringStateScreenshot, x[1], y[4], x[2] - x[1], y[4] + yts - y[4],
                    x[1], y[4], x[2] - x[1], y[4] + yts - y[4]);
            /* falls through */
            case 17:
                ctx.drawImage(this.enteringStateScreenshot, x[0], y[4], x[1] - x[0], y[4] + yts - y[4],
                    x[0], y[4], x[1] - x[0], y[4] + yts - y[4]);
            /* falls through */
            case 16:
                ctx.drawImage(this.enteringStateScreenshot, x[0], y[3], x[1] - x[0], y[4] - y[3], x[0], y[3],
                    x[1] - x[0], y[4] - y[3]);
            /* falls through */
            case 15:
                ctx.drawImage(this.enteringStateScreenshot, x[0], y[2], x[1] - x[0], y[3] - y[2], x[0], y[2],
                    x[1] - x[0], y[3] - y[2]);
            /* falls through */
            case 14:
                ctx.drawImage(this.enteringStateScreenshot, x[0], y[1], x[1] - x[0], y[2] - y[1], x[0], y[1],
                    x[1] - x[0], y[2] - y[1]);
            /* falls through */
            case 13:
                ctx.drawImage(this.enteringStateScreenshot, x[0], y[0], x[1] - x[0], y[1] - y[0], x[0], y[0],
                    x[1] - x[0], y[1] - y[0]);
            /* falls through */
            case 12:
                ctx.drawImage(this.enteringStateScreenshot, x[1], y[0], x[4] - x[1], y[4] - y[0], x[1], y[0],
                    x[4] - x[1], y[4] - y[0]);
                break;
            case 11:
                ctx.drawImage(this.enteringStateScreenshot, x[2], y[0], x[3] - x[2], y[1] - y[0], x[2], y[0],
                    x[3] - x[2], y[1] - y[0]);
            /* falls through */
            case 10:
                ctx.drawImage(this.enteringStateScreenshot, x[3], y[0], x[4] - x[3], y[1] - y[0], x[3], y[0],
                    x[4] - x[3], y[1] - y[0]);
            /* falls through */
            case 9:
                ctx.drawImage(this.enteringStateScreenshot, x[1], y[1], x[4] - x[1], y[4] - y[1], x[1], y[1],
                    x[4] - x[1], y[4] - y[1]);
                break;
            case 8:
                ctx.drawImage(this.enteringStateScreenshot, x[3], y[2], x[4] - x[3], y[3] - y[2], x[3], y[2],
                    x[4] - x[3], y[3] - y[2]);
            /* falls through */
            case 7:
                ctx.drawImage(this.enteringStateScreenshot, x[3], y[3], x[4] - x[3], y[4] - y[3], x[3], y[3],
                    x[4] - x[3], y[4] - y[3]);
            /* falls through */
            case 6:
                ctx.drawImage(this.enteringStateScreenshot, x[1], y[1], x[3] - x[1], y[4] - y[1], x[1], y[1],
                    x[3] - x[1], y[4] - y[1]);
                break;
            case 5:
                ctx.drawImage(this.enteringStateScreenshot, x[1], y[3], x[2] - x[1], y[4] - y[3], x[1], y[3],
                    x[2] - x[1], y[4] - y[3]);
            /* falls through */
            case 4:
                ctx.drawImage(this.enteringStateScreenshot, x[1], y[1], x[3] - x[1], y[3] - y[1], x[1], y[1],
                    x[3] - x[1], y[3] - y[1]);
                break;
            case 3:
                ctx.drawImage(this.enteringStateScreenshot, x[1], y[1], x[2] - x[1], y[2] - y[1], x[1], y[1],
                    x[2] - x[1], y[2] - y[1]);
            /* falls through */
            case 2:
                ctx.drawImage(this.enteringStateScreenshot, x[2], y[1], x[3] - x[2], y[3] - y[1], x[2], y[1],
                    x[3] - x[2], y[3] - y[1]);
                break;
            case 1:
                ctx.drawImage(this.enteringStateScreenshot, x[2], y[2], x[3] - x[2], y[3] - y[2], x[2], y[2],
                    x[3] - x[2], y[3] - y[2]);
                break;
        }

    }

    override update(delta: number) {

        this.handleDefaultKeys();

        if (this.tick === 0) {
            this.tick = this.game.playTime + BattleTransitionState.TICK_COUNT;
        } else {
            const time: number = this.game.playTime;
            if (time >= this.tick) {
                this.tick = time + BattleTransitionState.TICK_COUNT;
                this.state++;
                if (this.state === 25) {
                    this.game.setState(this.enteringState);
                }
            }
        }
    }
}
