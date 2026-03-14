import { InputManager } from 'gtp';
import { Bubble } from './Bubble';
import { DwGame } from './DwGame';

/**
 * A bubble that lets the user choose between several choices. Can optionally be titled
 * and be 2 columns if there are a lot of choices. Note you must provide its bounds and size
 * to accommodate your number of columns (this isn't currently figured out automatically).
 */
export class ChoiceBubble<ChoiceBubbleChoice> extends Bubble {

    private readonly choices: ChoiceBubbleChoice[];
    private readonly choiceStringifier: (choice: ChoiceBubbleChoice) => string;
    private curChoice: number;
    private readonly cancellable: boolean;
    private readonly columns: number;
    protected yInc: number;

    constructor(game: DwGame, x: number, y: number, w: number, h: number,
        choices: ChoiceBubbleChoice[] = [],
        choiceStringifier?: (choice: ChoiceBubbleChoice) => string,
        cancellable = false,
        title?: string,
        columns = 1) {
        super(game, title, x, y, w, h);
        this.choices = choices;
        this.choiceStringifier = choiceStringifier ?? ((choice: ChoiceBubbleChoice) => choice as unknown as string);
        this.cancellable = cancellable;
        this.columns = columns;
        this.curChoice = 0;
        this.yInc = 18 * this.game.scale;
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
    getSelectedItem(): ChoiceBubbleChoice | undefined {
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
            this.resetArrowTimer();
        } else if (this.game.actionKeyPressed()) {
            this.game.audio.playSound('menu');
            return true;
        } else if (im.up(true)) {
            if (this.columns === 2) {
                const leftCount = Math.ceil(this.choices.length / 2);
                const colMin = this.curChoice >= leftCount ? leftCount : 0;
                const colMax = this.curChoice >= leftCount ? this.choices.length - 1 : leftCount - 1;
                this.curChoice = this.curChoice === colMin ? colMax : this.curChoice - 1;
            } else {
                this.curChoice = this.curChoice === 0 ? this.choices.length - 1 : this.curChoice - 1;
            }
            this.resetArrowTimer();
        } else if (im.down(true)) {
            if (this.columns === 2) {
                const leftCount = Math.ceil(this.choices.length / 2);
                const colMax = this.curChoice >= leftCount ? this.choices.length - 1 : leftCount - 1;
                this.curChoice = Math.min(this.curChoice + 1, colMax);
            } else {
                this.curChoice = Math.min(this.curChoice + 1, this.choices.length - 1);
            }
            this.resetArrowTimer();
        } else if (this.columns === 2 && im.left(true)) {
            const leftCount = Math.ceil(this.choices.length / 2);
            if (this.curChoice >= leftCount) {
                this.curChoice -= leftCount;
            }
            this.resetArrowTimer();
        } else if (this.columns === 2 && im.right(true)) {
            const leftCount = Math.ceil(this.choices.length / 2);
            if (this.curChoice < leftCount) {
                this.curChoice = Math.min(this.curChoice + leftCount, this.choices.length - 1);
            }
            this.resetArrowTimer();
        }

        return false;
    }

    override paintContent(ctx: CanvasRenderingContext2D, x: number, y: number) {

        ctx.fillStyle = 'rgb(255,255,255)';

        if (this.columns === 2) {
            const leftCount = Math.ceil(this.choices.length / 2);
            const colGap = this.game.getTileSize();
            const contentWidth = this.w - 2 * this.getXMargin();
            const colWidth = (contentWidth - colGap) / 2;

            this.choices.forEach((choice, index) => {
                const inRight = index >= leftCount;
                const row = inRight ? index - leftCount : index;
                const textX = inRight ? x + colWidth + colGap : x;
                const textY = y + row * this.yInc;

                if (this.curChoice === index) {
                    const arrowX = inRight
                        ? this.x + Bubble.ARROW_MARGIN + colWidth + colGap
                        : this.x + Bubble.ARROW_MARGIN;
                    this.drawArrow(arrowX, textY);
                }
                this.game.drawString(this.choiceStringifier(choice), textX, textY);
            });
        } else {
            this.choices.forEach((choice, index) => {
                if (this.curChoice === index) {
                    this.drawArrow(this.x + Bubble.ARROW_MARGIN, y);
                }
                this.game.drawString(this.choiceStringifier(choice), x, y);
                y += this.yInc;
            });
        }
    }

    reset() {
        this.curChoice = 0;
    }

    setYInc(yInc: number) {
        this.yInc = yInc * this.game.scale;
    }
}
