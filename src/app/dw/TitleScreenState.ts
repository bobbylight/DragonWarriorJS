import { Delay, Image, InputManager } from 'gtp';
import { BaseState } from './BaseState';
import { DwGame } from './DwGame';
import { InitialMenuState } from './InitialMenuState';

export class TitleScreenState extends BaseState {

    private delay?: Delay;
    private blink: boolean;

    constructor(game: DwGame) {
        super(game);
        this.blink = true;
    }

    override enter() {
        super.enter();
        this.game.canvas.addEventListener('touchstart', this.handleStart.bind(this), false);
        this.delay = new Delay({ millis: [ 600, 400 ] });
        this.blink = true;
        this.game.audio.playMusic('MUSIC_TITLE_SCREEN');
    }

    override leaving() {
        this.game.canvas.removeEventListener('touchstart', this.handleStart.bind(this), false);
    }

    handleStart() {
        console.log('yee, touch detected!');
        this.loadNextState();
    }

    override update(delta: number) {

        this.handleDefaultKeys();

        if (this.delay?.update(delta)) {
            this.delay.reset();
            this.blink = !this.blink;
        }

        const im: InputManager = this.game.inputManager;
        if (im.enter(true)) {
            this.loadNextState();
        }

    }

    override render(ctx: CanvasRenderingContext2D) {

        const game: DwGame = this.game;
        game.clearScreen();
        const w: number = game.getWidth();

        const img: Image = game.assets.get('title');
        let x: number = (w - img.width) / 2;
        let y = 30;
        img.draw(ctx, x, y);

        if (!game.audio.isInitialized()) {
            let text = 'Sound is disabled as your';
            x = (w - game.stringWidth(text)) / 2;
            y = 390;
            game.drawString(text, x, y);
            text = 'browser does not support';
            x = (w - game.stringWidth(text)) / 2;
            y += 26;
            game.drawString(text, x, y);
            text = 'web audio';
            x = (w - game.stringWidth(text)) / 2;
            y += 26;
            game.drawString(text, x, y);
        }

        if (this.blink) {
            const prompt = 'Press Enter';
            x = (w - game.stringWidth(prompt)) / 2;
            y = 240;
            game.drawString(prompt, x, y);
        }
    }

    private loadNextState() {
        this.game.setState(new InitialMenuState(this.game));
    }
}
