import Bubble, {BreakApartDelay, BreakApartResult} from './Bubble';
import DwGame from './DwGame';
import ShoppingBubble from './ShoppingBubble';
import { Delay } from 'gtp';
import Conversation from './Conversation';
import ConversationSegment, {
    ConversationSegmentArgs,
    ConversationSegmentArgsChoice
} from './ConversationSegment';
import ChoiceBubble from './ChoiceBubble';
import Sellable from './Sellable';

type DoneCallback = () => void;

export default class TextBubble extends Bubble {

    private conversation: Conversation;
    private text: string;
    private curLine: number;
    private lines: string[];
    private delays: BreakApartDelay[];
    private curOffs: number;
    private curCharMillis: number;
    private textDone: boolean;
    private choiceBubble?: ChoiceBubble<ConversationSegmentArgsChoice> | null;
    private shoppingBubble?: ShoppingBubble | null;
    private delay?: Delay;
    private doneCallbacks: DoneCallback[];
    private afterSound: string | undefined;
    private overnight?: boolean;

    static readonly CHAR_RENDER_MILLIS: number = 0;
    static readonly MAX_LINE_COUNT: number = 6;

    constructor(game: DwGame) {

        const tileSize: number = game.getTileSize();
        const x: number = tileSize;
        const width: number = game.getWidth() - 2 * x;
        const height: number = game.getTileSize() * 5;
        const y: number = game.getHeight() - tileSize - height;
        super(game, undefined, x, y, width, height);
        this.doneCallbacks = [];
    }

    addToConversation(text: string | ConversationSegmentArgs, autoAdvance = false): void {
        this.conversation.addSegment(text);

        if (autoAdvance && this.textDone) {
            this.updateConversation();
        } else {
            console.log(`oh no - ${autoAdvance}, ${this.textDone}`);
        }
    }

    private append(segment: ConversationSegment): void {

        const curText: string | undefined = segment.currentText();
        if (!curText) {
            return;
        }

        this.text = this.text + '\n' + curText;
        this.curLine = this.lines.length;
        const w: number = this.w - 2 * Bubble.MARGIN;
        const breakApartResult: BreakApartResult = this.breakApart(curText, w);
        this.lines = this.lines.concat(breakApartResult.lines);
        this.delays = breakApartResult.delays;
        this.curOffs = -1;
        this.curCharMillis = 0;
        this.textDone = false;
        console.log('>>> textDone set to false');
        if (segment.choices) {
            this.choiceBubble = this.createChoiceBubble(segment.choices);
            this.setActive(false);
        } else if (segment.shopping) {
            this.shoppingBubble = new ShoppingBubble(this.game, segment.shopping);
            this.setActive(false);
        }
    }

    private createChoiceBubble(choices: ConversationSegmentArgsChoice[]): ChoiceBubble<ConversationSegmentArgsChoice> {

        const tileSize: number = this.game.getTileSize();
        const x: number = this.game.getWidth() - tileSize * 6;
        const y: number = tileSize;
        const width: number = tileSize * 5;
        const height: number = tileSize * (choices.length + 1);

        return new ChoiceBubble(this.game, x, y, width, height, choices, 'text');
    }

    /**
     * Returns the next state from a conversation segment's arguments.
     */
    private static getNextState(choice: ConversationSegmentArgsChoice): string | undefined {
        if (typeof choice === 'string') {
            return undefined;
        }
        if (typeof choice.next === 'string') {
            return choice.next;
        }
        return choice.next();
    }

    /**
     * Returns whether the user is "done" talking; that is, whether the entire
     * conversation has been rendered (including multiple pages, if necessary).
     */
    handleInput(): boolean {

        let result: boolean;
        let nextState: string | undefined;

        if (this.textDone) {
            if (this.shoppingBubble) {
                result = this.shoppingBubble.handleInput();
                if (result) {
                    const item: Sellable | undefined = this.shoppingBubble.getSelectedItem();
                    delete this.shoppingBubble;
                    this.setActive(true);
                    if (item) {
                        this.conversation.setItem(item);
                        nextState = item.baseCost > this.game.party.gold ?
                            Conversation.NOT_ENOUGH_SEGMENT : Conversation.CONFIRM_SEGMENT;
                        return !this.updateConversation(nextState);
                    } else {
                        return !this.updateConversation(Conversation.SOMETHING_ELSE_SEGMENT);
                    }
                }
                return false;
            } else if (this.choiceBubble) {
                result = this.choiceBubble.handleInput();
                if (result) {
                    const choice: ConversationSegmentArgsChoice = this.choiceBubble.getSelectedItem()!;
                    nextState = TextBubble.getNextState(choice);
                    //this._conversation.setDialogueState(nextState);
                    delete this.choiceBubble;
                    this.setActive(true);
                    return !this.updateConversation(nextState);
                }
                return false;
            }
        }

        if (this.game.anyKeyDown()) {
            if (!this.textDone) {
                this.textDone = true;
                if (this.lines.length > TextBubble.MAX_LINE_COUNT) {
                    this.lines.splice(0, this.lines.length - TextBubble.MAX_LINE_COUNT);
                }
                this.curLine = this.lines.length - 1;
            } else {
                return !this.updateConversation();
            }
        }
        return false;
    }

    /**
     * Immediately plays, or remembers to play, audio bits for a conversation
     * segment as appropriate.
     */
    handleSegmentAudio(segment: ConversationSegment): void {
        if (segment.sound) {
            this.game.audio.playSound(segment.sound);
        }
        if (segment.music) {
            this.game.audio.playMusic(segment.music);
        }
        if (segment.afterSound) {
            this.afterSound = segment.afterSound;
        }
        else if (segment.choices) {
            this.afterSound = 'confirmation';
        }
    }

    /**
     * Forces the conversation to go to the next segment.  Should only be called
     * internally.  This is a sign of bad design.
     */
    nudgeConversation(): void {
        this.updateConversation();
    }

    /**
     * Returns true if the current conversation has completed.
     */
    isDone(): boolean {
        return this.textDone && !this.choiceBubble &&
            !this.shoppingBubble && !this.conversation?.hasNext();
    }

    currentTextDone(): boolean {
        return this.textDone;
    }

    isOvernight(): boolean {
        return !!this.overnight;
    }

    clearOvernight(): void {
        delete this.overnight;
    }

    onDone(callback: DoneCallback): void {
        if (this.isDone()) {
            callback();
        } else {
            this.doneCallbacks.push(callback);
        }
    }

    override updateImpl(delta: number): void {

        if (this.delay) {
            if (this.delay.update(delta)) {
                delete this.delay;
            } else {
                return;
            }
        }

        // Ensure the blinking "down" arrow is always on a line
        if (this.textDone &&
                this.curOffs === -1 && this.curLine === TextBubble.MAX_LINE_COUNT - 1 &&
                this.conversation.hasNext()) {
            this.lines.shift();
            this.curLine--;
        }

        if (!this.textDone) {
            this.curCharMillis += delta;
            if (this.curCharMillis > TextBubble.CHAR_RENDER_MILLIS) {
                this.curCharMillis -= TextBubble.CHAR_RENDER_MILLIS;
                if (this.curOffs === -1 && this.curLine === TextBubble.MAX_LINE_COUNT) {
                    this.lines.shift();
                    this.curLine--;
                }
                // TODO: This could be more performant...
                if (this.delays && this.delays.length > 0) {
                    const elem = this.delays[0];
                    if (elem.offs === this.curOffs + 1) {
                        this.delays.shift();
                        this.delay = new Delay({millis: elem.millis});
                        return;
                    }
                }
                this.curOffs++;
                if (this.curOffs === this.lines[this.curLine].length) {
                    if (this.curLine === this.lines.length - 1) {
                        console.log('Setting textDone to true');
                        this.textDone = true;
                        if (this.afterSound) {
                            this.game.audio.playSound(this.afterSound);
                            delete this.afterSound;
                        }
                    } else {
                        console.log('Going to next line');
                        this.curLine++;
                    }
                    this.curOffs = -1;
                }
                else if (this.conversation.getVoice() &&
                        this.curOffs % 2 === 0 && this.lines[this.curLine][this.curOffs] !== ' ') {
                    this.game.audio.playSound('talk');
                }
            }
        } else if (this.shoppingBubble) {
            this.shoppingBubble.update(delta);
        } else if (this.choiceBubble) {
            this.choiceBubble.update(delta);
        }

        if (this.doneCallbacks.length > 0 && this.isDone()) {
            this.doneCallbacks.forEach((callback: () => void) => {
                callback();
            });
            this.doneCallbacks = [];
        }

    }

    override paintContent(ctx: CanvasRenderingContext2D, x: number, y: number): void {

        ctx.fillStyle = 'rgb(255,255,255)';
        if (this.lines) {
            for (let i = 0; i <= this.curLine; i++) {
                let text: string = this.lines[i];
                if (!this.textDone && i === this.curLine) {
                    const end: number = Math.max(0, this.curOffs);
                    text = text.substring(0, end);
                }
                this.game.drawString(text, x, y);
                y += 10 * this.game.scale;
            }
            if (this.textDone && this.conversation.hasNext()) {
                // TODO: Remove magic constants
                const x: number = this.x + (this.w - this.game.stringWidth('\\')) / 2;
                this.drawDownArrow(x, y);
                /*
                var conv = this._conversation;
                console.log('--- ' +
                      JSON.stringify(this._conversation.peekNext(),
                            // Custom replacer to prevent circular printing of conversation
                            function(key, value) {
                               if (value === conv) {
                                  return;
                               }
                               return value;
                            }
                      )
                );
                */
            }
        }

        if (this.textDone) {
            if (this.shoppingBubble) {
                this.shoppingBubble.paint(ctx);
            } else if (this.choiceBubble) {
                this.choiceBubble.paint(ctx);
            }
        }

    }

    /**
     * Renders text in this bubble.
     *
     * @param segment The text to render.
     */
    private setText(segment: ConversationSegment): void {
        this.text = segment.currentText() ?? '';
        if (this.text) {
            const w: number = this.w - 2 * Bubble.MARGIN;
            const breakApartResult: BreakApartResult = this.breakApart(this.text, w);
            this.lines = breakApartResult.lines;
            this.delays = breakApartResult.delays;
            this.curLine = 0;
            this.curOffs = -1;
            this.curCharMillis = 0;
            this.textDone = false;
            console.log('>>> textDone set to false');
        }
        if (segment.choices) {
            this.choiceBubble = this.createChoiceBubble(segment.choices);
            this.setActive(false);
        } else if (segment.shopping) {
            this.shoppingBubble = new ShoppingBubble(this.game, segment.shopping);
            this.setActive(false);
        }
    }

    setConversation(conversation: Conversation): void {
        delete this.shoppingBubble;
        delete this.choiceBubble;
        this.conversation = conversation;
        const segment: ConversationSegment = this.conversation.start();
        this.setText(segment);
        this.handleSegmentAudio(segment);
    }

    private updateConversation(forcedNextState?: string): boolean {

        if (forcedNextState || this.conversation.hasNext()) {
            if (this.conversation.current()!.overnight && this.textDone) {
                this.overnight = true;
            }
            let segment: ConversationSegment;
            if (forcedNextState) {
                this.conversation.setDialogueState(forcedNextState);
                segment = this.conversation.current(true)!;
            } else {
                segment = this.conversation.next(true)!;
            }
//            if (segment.overnight) {
//               this._overnight = true;
//            } else
            if (segment.clear) {
                this.setText(segment);
            } else {
                this.append(segment);
            }
            this.handleSegmentAudio(segment);
            return true;
        }
        return false;
    }
}
