import { Delay, FadeOutInState } from 'gtp';
import { BaseState } from './BaseState';
import { DwGame } from './DwGame';
import { TitleScreenState } from './TitleScreenState';

export class GameStudioAdvertState extends BaseState {

    private readonly delay: Delay;

    constructor(game: DwGame) {
        super(game);
        this.delay = new Delay({ millis: 3000 });
    }

    override update(delta: number) {

        this.handleDefaultKeys();

        if (this.delay.update(delta) || this.game.anyKeyDown(true)) {
            this.startGame();
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

        const prompt = 'OutOnBail Games Presents';
        const x: number = (w - game.stringWidth(prompt)) / 2;
        const y: number = (game.getHeight() - game.stringHeight()) / 2;
        game.drawString(prompt, x, y);
    }

    private startGame() {
        this.game.setState(new FadeOutInState(this, new TitleScreenState(this.game)));
    }
}
