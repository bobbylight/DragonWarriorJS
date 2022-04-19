import Bubble from './Bubble';
import { InputManager } from 'gtp';

/**
 * A bubble that lets the user choose between several choices.
 */
export default class ChoiceBubble<T> extends Bubble {

    private readonly choices: T[];
    private readonly choiceDisplayField?: string;
    private curChoice: number;
    private readonly cancellable: boolean;

    constructor(x: number, y: number, w: number, h: number,
                choices: T[] = [],
                choiceDisplayField?: string,
                cancellable: boolean = false,
                title: string | undefined = undefined) {
        super(title, x, y, w, h);
        this.choices = choices;
        this.choiceDisplayField = choiceDisplayField;
        this.cancellable = cancellable;
        this.curChoice = 0;
    }

    /**
     * Returns the index of the item selected, or <code>-1</code> if the
     * user cancelled this dialog.
     */
    getSelectedIndex(): number {
        return this.curChoice;
    }

    /**
     * Returns the item selected, or <code>undefined</code> if the user
     * cancelled this dialog.
     */
    getSelectedItem(): T | undefined {
        return this.curChoice > -1 ? this.choices[this.curChoice] : undefined;
    }

    /**
     * Allows this bubble to react to user input.
     *
     * @return Whether a choice was made.
     */
    handleInput(): boolean {

        const im: InputManager = this.game.inputManager;

        if (this.game.cancelKeyPressed()) {
            if (this.cancellable) {
                this.curChoice = -1;
                return true;
            }
            this.curChoice = 0;
        } else if (this.game.actionKeyPressed()) {
            return true;
        } else if (im.up(true)) {
            this.curChoice = Math.max(0, this.curChoice - 1);
        } else if (im.down(true)) {
            this.curChoice = Math.min(this.curChoice + 1, this.choices.length - 1);
        }

        return false;
    }

    override paintContent(ctx: CanvasRenderingContext2D, x: number, y: number) {

        ctx.fillStyle = 'rgb(255,255,255)';
        this.choices.forEach((choice, index) => {
            if (this.curChoice === index) {
                this.game.drawArrow(this.x + Bubble.MARGIN, y);
            }
            this.game.drawString(this.stringify(choice), x, y);
            y += 18 * this.game.scale;
        });
    }

    reset() {
        this.curChoice = 0;
    }

    private stringify(choice: T): string {
        if (this.choiceDisplayField) {
            return choice[this.choiceDisplayField];
        }
        return choice as unknown as string;
    }
}
