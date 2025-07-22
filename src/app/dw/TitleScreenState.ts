import { _BaseState } from './_BaseState';
import { Delay, Image, InputManager } from 'gtp';
import DwGame from './DwGame';
import { InitialMenuState } from './InitialMenuState';

export class TitleScreenState extends _BaseState {

    assetsLoaded: boolean;
    private _delay: Delay;
    private _blink: boolean;

    constructor(args?: any) {
        super(args);
        this.assetsLoaded = false;
    }

    override enter(game: DwGame) {
        super.enter(game);
        game.canvas.addEventListener('touchstart', this.handleStart.bind(this), false);
        this._delay = new Delay({millis: [600, 400]});
        this._blink = true;
        game.audio.playMusic('MUSIC_TITLE_SCREEN');
    }

    override leaving(game: DwGame) {
        game.canvas.removeEventListener('touchstart', this.handleStart.bind(this), false);
    }

    handleStart() {
        console.log('yee, touch detected!');
        this.loadNextState();
    }

    override update(delta: number) {

        this.handleDefaultKeys();

        if (this._delay.update(delta)) {
            this._delay.reset();
            this._blink = !this._blink;
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
        let y: number = 30;
        img.draw(ctx, x, y);

        if (!game.audio.isInitialized()) {
            let text: string = 'Sound is disabled as your';
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

        if (this._blink) {
            const prompt: string = 'Press Enter';
            x = (w - game.stringWidth(prompt)) / 2;
            y = 240;
            game.drawString(prompt, x, y);
        }
    }

    private loadNextState() {
        this.game.setState(new InitialMenuState());
    }
}
