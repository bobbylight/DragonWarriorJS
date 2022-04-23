import DwGame from './DwGame';
import Bubble from './Bubble';
import Item from './Item';
import { InputManager } from 'gtp';

export default class ItemBubble extends Bubble {

    private readonly _choices: Item[];
    private _curChoice: number;

    constructor() {

        const game: DwGame = (window as any).game as DwGame;

        const scale: number = game.scale;
        const tileSize: number = game.getTileSize();
        const w: number = 7 * tileSize;
        const h: number = 100 * scale;
        const x: number = 9 * tileSize;
        const y: number = 3 * tileSize;
        super(undefined, x, y, w, h);

        this._choices = game.party.getInventory().getItems();
        this._curChoice = 0;
    }

    getAndRemoveSelectedItem(): Item | null {
        if (this._curChoice === -1) {
            return null;
        }
        return this._choices.splice(this._curChoice, 1)[0];
    }

    handleInput() {

        const im: InputManager = this.game.inputManager;

        if (this.game.cancelKeyPressed()) {
            this._curChoice = -1;
            return true;
        } else if (this.game.actionKeyPressed()) {
            return true;
        } else if (im.up(true)) {
            this._curChoice = Math.max(0, this._curChoice - 1);
            this.resetArrowTimer();
        } else if (im.down(true)) {
            this._curChoice = Math.min(this._curChoice + 1, this._choices.length - 1);
            this.resetArrowTimer();
        }

        return false;
    }

    override paintContent(ctx: CanvasRenderingContext2D, x: number, y: number) {

        ctx.fillStyle = 'rgb(255,255,255)';
        this._choices.forEach((choice, index) => {
            if (this._curChoice === index) {
                this.drawArrow(this.x + Bubble.MARGIN, y);
            }
            this.game.drawString(choice.displayName, x, y);
            y += 10 * this.game.scale;
        });
    }
}
