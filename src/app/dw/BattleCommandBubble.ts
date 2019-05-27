import Bubble from './Bubble';
import BattleState from './BattleState';
import { InputManager } from 'gtp';

export default class BattleCommandBubble extends Bubble {

    selection: number;

    constructor(args: any) {

        console.log('hi');

        const tileSize: number = (window as any).game.getTileSize();

        super('COMMAND', 8 * tileSize, tileSize, tileSize * 8, tileSize * 3);

        this.selection = 0;
    }

    handleCommandChosen(state: BattleState) {

        switch (this.selection) {

            case 0: // Fight
                state.fight();
                break;

            case 1: // Run
                state.run();
                break;

            case 2: // Spell
                //state.spell();
                break;

            case 3: // Item
                state.item();
                break;

        }

    }

    handleInput() {

        const im: InputManager = this.game.inputManager;

        if (im.up(true)) {
            this.selection = this.selection - 1;
            if (this.selection < 0) {
                this.selection = 3;
            }
        } else if (im.down(true)) {
            this.selection = Math.floor((this.selection + 1) % 4);
        } else if (this.selection > 1 && im.left(true)) {
            this.selection -= 2;
        } else if (this.selection < 2 && im.right(true)) {
            this.selection += 2;
        } else if (this.game.cancelKeyPressed()) {
            this.reset();
            return false;
        } else if (this.game.actionKeyPressed()) {
            this.game.audio.playSound('menu');
            return true;
        }

        return false;

    }

    paintContent(ctx: CanvasRenderingContext2D, y: number) {

        const SCALE: number = this.game.scale;
        let x: number = this.x + 20 * SCALE;
        let y0: number = y;
        const Y_INC: number = this.game.stringHeight() + 6 * SCALE;

        this.game.drawString('FIGHT', x, y0);
        y0 += Y_INC;
        this.game.drawString('RUN', x, y0);
        y0 += Y_INC;

        x += 64 * SCALE;
        y0 -= 2 * Y_INC;
        this.game.drawString('SPELL', x, y0);
        y0 += Y_INC;
        this.game.drawString('ITEM', x, y0);
        y0 += Y_INC;

        if (this.selection < 2) {
            x -= 64 * SCALE;
        }
        x -= this.game.stringWidth('>') + 2 * SCALE;
        y0 = y + Y_INC * (this.selection % 2);

        this.game.drawArrow(x, y0); // DEL, but we use for our arrow

    }

    reset() {
        this.selection = 0;
    }
}
