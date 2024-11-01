import { _BaseState } from './_BaseState';
import { Delay, FadeOutInState } from 'gtp';
import DwGame from './DwGame';
import { TitleScreenState } from './TitleScreenState';

export class GameStudioAdvertState extends _BaseState {

    private readonly _delay: Delay;

    constructor(args: any = {}) {
        super(args);
        this._delay = new Delay({ millis: 3000 });
    }

    override update(delta: number) {

        this.handleDefaultKeys();

        if (this._delay.update(delta) || this.game.anyKeyDown(true)) {
            this._startGame();
        }
    }

    override render(ctx: CanvasRenderingContext2D) {

        const game: DwGame = this.game;
        game.clearScreen();
        const w: number = game.getWidth();

//         var img = game.assets.get('gameStudioLogo');
//         var x = (w - img.width) / 2;
//         var y = 30;
//         img.draw(ctx, x, y);

        const prompt: string = 'OutOnBail Games Presents';
        const x: number = (w - game.stringWidth(prompt)) / 2;
        const y: number = (game.getHeight() - game.stringHeight()) / 2;
        game.drawString(prompt, x, y);
    }

    private _startGame() {
        this.game.setState(new FadeOutInState(this, new TitleScreenState()));
    }
}
