import Bubble from './Bubble';
import { InputManager } from 'gtp';
import DwGame from "./DwGame";

type ChoiceBubbleStringMap = Record<string, string>;
export type ChoiceBubbleChoice = string | ChoiceBubbleStringMap;

/**
 * A bubble that lets the user choose between several choices.
 */
export default class ChoiceBubble<ChoiceBubbleChoice> extends Bubble {

    private readonly choices: ChoiceBubbleChoice[];
    private readonly choiceDisplayField?: string;
    private curChoice: number;
    private readonly cancellable: boolean;

    constructor(game: DwGame, x: number, y: number, w: number, h: number,
                choices: ChoiceBubbleChoice[] = [],
                choiceDisplayField?: string,
                cancellable = false,
                title: string | undefined = undefined) {
        super(game, title, x, y, w, h);
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
            this.game.drawString(this.stringify(choice), x, y);
            y += 18 * this.game.scale;
        });
    }

    reset() {
        this.curChoice = 0;
    }

    private stringify(choice: ChoiceBubbleChoice): string {
        if (this.choiceDisplayField) {
            return (choice as ChoiceBubbleStringMap)[this.choiceDisplayField];
        }
        return choice as unknown as string;
    }
}
