import { BaseStateArgs, ImageUtils, InputManager, Keys, State } from 'gtp';
import DwGame from './DwGame';

/**
 * Functionality common amongst all states in this game.
 */
export class BaseState extends State<DwGame> {

    constructor(args?: DwGame | BaseStateArgs<DwGame>) {

        const game: DwGame = (window as any).game;

        if (!args) {
            args = { game };
        }
        else if (!(args instanceof DwGame) && !args.game) {
            args.game = game;
        }

        super(args);
    }

    createScreenshot() {
        const canvas: HTMLCanvasElement = ImageUtils.createCanvas(this.game.getWidth(), this.game.getHeight());
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D rendering context from canvas.');
        }
        this.render(ctx);
        return canvas;
    }

    private static handleCanvasResizingKeys(im: InputManager, canvas: HTMLCanvasElement, game: DwGame): boolean {

        // Increase canvas size
        if (im.isKeyDown(Keys.KEY_P, true)) {
            if (!canvas.style.width) {
                canvas.style.width = `${canvas.width}px`;
            }
            if (!canvas.style.height) {
                canvas.style.height = `${canvas.height}px`;
            }
            canvas.style.width = `${parseInt(canvas.style.width.substring(0, canvas.style.width.length - 2), 10) + 1}px`;
            canvas.style.height = `${parseInt(canvas.style.height.substring(0, canvas.style.height.length - 2), 10) + 1}px`;
            game.setStatusMessage(`Canvas size now: (${canvas.style.width}, ${canvas.style.height})`);

            return true;
        }

        // Decrease canvas size
        if (im.isKeyDown(Keys.KEY_L, true)) {
            if (!canvas.style.width) {
                canvas.style.width = `${canvas.width}px`;
            }
            if (!canvas.style.height) {
                canvas.style.height = `${canvas.height}px`;
            }
            canvas.style.width = `${parseInt(canvas.style.width.substring(0, canvas.style.width.length - 2), 10) - 1}px`;
            canvas.style.height = `${parseInt(canvas.style.height.substring(0, canvas.style.height.length - 2), 10) - 1}px`;
            game.setStatusMessage(`Canvas size now: (${canvas.style.width}, ${canvas.style.height})`);
            return true;
        }

        return false;
    }

    handleDefaultKeys() {

        // Debugging actions are hidden behind the shift key
        if (this.game.inputManager.shift()) {
            this.handleDefaultDebugKeys();
        }
    }

    private handleDefaultDebugKeys() {

        const im: InputManager = this.game.inputManager;
        const canvas: HTMLCanvasElement = this.game.canvas;
        const game: DwGame = this.game;

        if (BaseState.handleCanvasResizingKeys(im, canvas, game)) {
            return;
        }

        // Audio stuff
        if (im.isKeyDown(Keys.KEY_M, true)) {
            game.toggleMuted();
        }

        // Equipment testing
        else if (im.isKeyDown(Keys.KEY_W, true)) {
            game.cycleWeapon();
        } else if (im.isKeyDown(Keys.KEY_A, true)) {
            game.cycleArmor();
        } else if (im.isKeyDown(Keys.KEY_S, true)) {
            game.cycleShield();
        }

        // Stat testing
        else if (im.isKeyDown(Keys.KEY_H, true)) {
            if (im.ctrl()) {
                game.setHeroStats(1, 1);
            } else {
                game.setHeroStats(255, 255);
            }
        } else if (im.isKeyDown(Keys.KEY_K, true)) {
            if (im.ctrl()) {
                game.setHeroStats(null, null, 0, 0);
            } else {
                game.setHeroStats(null, null, 255, 255);
            }
        } else if (im.isKeyDown(Keys.KEY_T, true)) {
            game.setUsingTorch(!game.getUsingTorch());
        }

        // Options generally useful for debugging
        else if (im.isKeyDown(Keys.KEY_U, true)) {
            game.hero.setMoveIncrement(4);
            game.setStatusMessage('Hero speed === 4');
        } else if (im.isKeyDown(Keys.KEY_D, true)) {
            game.hero.setMoveIncrement(2);
            game.setStatusMessage('Hero speed === 2');
        } else if (im.isKeyDown(Keys.KEY_E, true)) {
            game.toggleRandomEncounters();
        }
    }
}
