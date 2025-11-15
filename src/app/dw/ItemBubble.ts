import { InputManager } from 'gtp';
import { DwGame } from './DwGame';
import { Bubble } from './Bubble';
import { Item } from './Item';
import { ItemCountPair } from './Inventory';

export class ItemBubble extends Bubble {

    private readonly choices: ItemCountPair[];
    private curChoice: number;

    constructor(game: DwGame) {

        const scale: number = game.scale;
        const tileSize: number = game.getTileSize();
        const w: number = 7 * tileSize;
        const h: number = 100 * scale;
        const x: number = 9 * tileSize;
        const y: number = 3 * tileSize;
        super(game, undefined, x, y, w, h);

        this.choices = game.party.getInventory().getItems();
        this.curChoice = 0;
    }

    getSelectedItem(): Item | undefined {
        return this.curChoice > -1 ? this.choices[this.curChoice].item : undefined;
    }

    handleInput() {

        const im: InputManager = this.game.inputManager;

        if (this.game.cancelKeyPressed()) {
            this.curChoice = -1;
            return true;
        } else if (this.game.actionKeyPressed()) {
            return true;
        } else if (im.up(true)) {
            this.curChoice = Math.max(0, this.curChoice - 1);
            this.resetArrowTimer();
        } else if (im.down(true)) {
            this.curChoice = Math.min(this.curChoice + 1, this.choices.length - 1);
            this.resetArrowTimer();
        }

        return false;
    }

    override paintContent(ctx: CanvasRenderingContext2D, x: number, y: number) {

        ctx.fillStyle = 'rgb(255,255,255)';
        this.choices.forEach((choice, index) => {
            if (this.curChoice === index) {
                this.drawArrow(this.x + Bubble.MARGIN, y);
            }
            this.game.drawString(choice.item.displayName, x, y);
            y += 10 * this.game.scale;
        });
    }

    removeSelectedItem() {
        if (this.curChoice > -1) {
            this.choices.splice(this.curChoice, 1);
        }
    }
}
