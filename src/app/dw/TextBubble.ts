import Bubble, { BreakApartResult } from './Bubble';
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

export default class TextBubble extends Bubble {

    private _conversation: Conversation;
    private _talking: boolean;
    private _text: string;
    private _curLine: number;
    private _lines: string[];
    private _delays: any[];
    private _curOffs: number;
    private _curCharMillis: number;
    private _textDone: boolean;
    private _choiceBubble?: ChoiceBubble<ConversationSegmentArgsChoice> | null;
    private _shoppingBubble?: ShoppingBubble | null;
    private _delay?: Delay;
    private _doneCallbacks: any[];
    private _afterSound: any;
    private _overnight?: boolean;

    static readonly CHAR_RENDER_MILLIS: number = 0;
    static readonly MAX_LINE_COUNT: number = 6;

    constructor(game: DwGame) {

        const tileSize: number = game.getTileSize();
        const x: number = tileSize;
        const width: number = game.getWidth() - 2 * x;
        const height: number = game.getTileSize() * 5;
        const y: number = game.getHeight() - tileSize - height;
        super(undefined, x, y, width, height);
        this._doneCallbacks = [];
        this._talking = false;
    }

    addToConversation(text: string | ConversationSegmentArgs, autoAdvance: boolean = false): void {
        this._conversation.addSegment(text);

        if (autoAdvance && this._textDone) {
            this._updateConversation();
        } else {
            console.log('oh no - ' + autoAdvance + ', ' + this._textDone);
        }
    }

    private append(segment: ConversationSegment): void {

        const curText: string = segment.currentText();
        this._text = this._text + '\n' + curText;
        this._curLine = this._lines.length;
        const w: number = this.w - 2 * Bubble.MARGIN;
        const breakApartResult: BreakApartResult = this._breakApart(curText, w);
        this._lines = this._lines.concat(breakApartResult.lines);
        this._delays = breakApartResult.delays;
        this._curOffs = -1;
        this._curCharMillis = 0;
        this._textDone = false;
        console.log('>>> textDone set to false');
        if (segment.choices) {
            this._choiceBubble = this.createChoiceBubble(segment.choices);
            this.setActive(false);
        } else if (segment.shopping) {
            this._shoppingBubble = new ShoppingBubble(this.game, segment.shopping);
            this.setActive(false);
        }
    }

    private createChoiceBubble(choices: ConversationSegmentArgsChoice[]): ChoiceBubble<ConversationSegmentArgsChoice> {

        const tileSize: number = this.game.getTileSize();
        const x: number = this.game.getWidth() - tileSize * 6;
        const y: number = tileSize;
        const width: number = tileSize * 5;
        const height: number = tileSize * 5;

        return new ChoiceBubble(x, y, width, height, choices, 'text');
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

        if (this._textDone) {
            if (this._shoppingBubble) {
                result = this._shoppingBubble.handleInput();
                if (result) {
                    const item: Sellable | undefined = this._shoppingBubble.getSelectedItem();
                    delete this._shoppingBubble;
                    this.setActive(true);
                    if (item) {
                        this._conversation.setItem(item);
                        nextState = item.baseCost > this.game.party.gold ?
                            Conversation.NOT_ENOUGH_SEGMENT : Conversation.CONFIRM_SEGMENT;
                        return !this._updateConversation(nextState);
                    } else {
                        return !this._updateConversation(Conversation.SOMETHING_ELSE_SEGMENT);
                    }
                }
                return false;
            } else if (this._choiceBubble) {
                result = this._choiceBubble.handleInput();
                if (result) {
                    const choice: ConversationSegmentArgsChoice = this._choiceBubble.getSelectedItem()!;
                    nextState = TextBubble.getNextState(choice);
                    //this._conversation.setDialogueState(nextState);
                    delete this._choiceBubble;
                    this.setActive(true);
                    return !this._updateConversation(nextState);
                }
                return false;
            }
        }

        if (this.game.anyKeyDown()) {
            if (!this._textDone) {
                this._textDone = true;
                if (this._lines.length > TextBubble.MAX_LINE_COUNT) {
                    this._lines.splice(0, this._lines.length - TextBubble.MAX_LINE_COUNT);
                }
                this._curLine = this._lines.length - 1;
            } else {
                return !this._updateConversation();
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
            this._afterSound = segment.afterSound;
        }
    }

    /**
     * Forces the conversation to go to the next segment.  Should only be called
     * internally.  This is a sign of bad design.
     */
    nudgeConversation(): void {
        this._updateConversation();
    }

    /**
     * Returns true if the current conversation has completed.
     */
    isDone(): boolean {
        return this._textDone && !this._choiceBubble &&
            !this._shoppingBubble &&
            (!this._conversation || !this._conversation.hasNext());
    }

    currentTextDone(): boolean {
        return this._textDone;
    }

    isOvernight(): boolean {
        return !!this._overnight;
    }

    clearOvernight(): void {
        delete this._overnight;
    }

    onDone(callback: Function): void {
        if (this.isDone()) {
            callback();
        } else {
            this._doneCallbacks.push(callback);
        }
    }

    updateImpl(delta: number): void {

        if (this._delay) {
            if (this._delay.update(delta)) {
                delete this._delay;
            } else {
                return;
            }
        }

        // Ensure the blinking "down" arrow is always on a line
        if (this._textDone &&
                this._curOffs === -1 && this._curLine === TextBubble.MAX_LINE_COUNT - 1 &&
                this._conversation.hasNext()) {
            this._lines.shift();
            this._curLine--;
        }

        if (!this._textDone) {
            this._curCharMillis += delta;
            if (this._curCharMillis > TextBubble.CHAR_RENDER_MILLIS) {
                this._curCharMillis -= TextBubble.CHAR_RENDER_MILLIS;
                if (this._curOffs === -1 && this._curLine === TextBubble.MAX_LINE_COUNT) {
                    this._lines.shift();
                    this._curLine--;
                }
                // TODO: This could be more performant...
                if (this._delays && this._delays.length > 0) {
                    const elem: any = this._delays[0];
                    if (elem.offs === this._curOffs + 1) {
                        this._delays.shift();
                        this._delay = new Delay({millis: elem.millis});
                        return;
                    }
                }
                this._curOffs++;
                if (this._curOffs === this._lines[this._curLine].length) {
                    if (this._curLine === this._lines.length - 1) {
                        console.log('Setting textDone to true');
                        this._textDone = true;
                        if (this._afterSound) {
                            this.game.audio.playSound(this._afterSound);
                            delete this._afterSound;
                        }
                    } else {
                        console.log('Going to next line');
                        this._curLine++;
                    }
                    this._curOffs = -1;
                }
                else if (this._conversation.getVoice() &&
                        this._curOffs % 2 === 0 && this._lines[this._curLine][this._curOffs] !== ' ') {
                    this.game.audio.playSound('talk');
                }
            }
        } else if (this._shoppingBubble) {
            this._shoppingBubble.update(delta);
        } else if (this._choiceBubble) {
            this._choiceBubble.update(delta);
        }

        if (this._doneCallbacks.length > 0 && this.isDone()) {
            this._doneCallbacks.forEach((callback: Function) => {
                callback();
            });
            this._doneCallbacks = [];
        }

    }

    override paintContent(ctx: CanvasRenderingContext2D, x: number, y: number): void {

        ctx.fillStyle = 'rgb(255,255,255)';
        if (this._lines) {
            for (let i: number = 0; i <= this._curLine; i++) {
                let text: string = this._lines[i];
                if (!this._textDone && i === this._curLine) {
                    const end: number = Math.max(0, this._curOffs);
                    text = text.substring(0, end);
                }
                this.game.drawString(text, x, y);
                y += 10 * this.game.scale;
            }
            if (this._textDone && this._conversation.hasNext()) {
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

        if (this._textDone) {
            if (this._shoppingBubble) {
                this._shoppingBubble.paint(ctx);
            } else if (this._choiceBubble) {
                this._choiceBubble.paint(ctx);
            }
        }

    }

    /**
     * Renders text in this bubble.
     *
     * @param segment The text to render.
     */
    private _setText(segment: ConversationSegment): void {
        this._text = segment.currentText();
        if (this._text) {
            const w: number = this.w - 2 * Bubble.MARGIN;
            const breakApartResult: BreakApartResult = this._breakApart(this._text, w);
            this._lines = breakApartResult.lines;
            this._delays = breakApartResult.delays;
            this._curLine = 0;
            this._curOffs = -1;
            this._curCharMillis = 0;
            this._textDone = false;
            console.log('>>> textDone set to false');
        }
        if (segment.choices) {
            this._choiceBubble = this.createChoiceBubble(segment.choices);
            this.setActive(false);
        } else if (segment.shopping) {
            this._shoppingBubble = new ShoppingBubble(this.game, segment.shopping);
            this.setActive(false);
        }
    }

    setConversation(conversation: Conversation): void {
        delete this._shoppingBubble;
        delete this._choiceBubble;
        this._conversation = conversation;
        const segment: ConversationSegment = this._conversation.start();
        this._setText(segment);
        this.handleSegmentAudio(segment);
    }

    private _updateConversation(forcedNextState?: string): boolean {

        if (forcedNextState || this._conversation.hasNext()) {
            if (this._conversation.current()!.overnight && this._textDone) {
                this._overnight = true;
            }
            let segment: ConversationSegment;
            if (forcedNextState) {
                this._conversation.setDialogueState(forcedNextState);
                segment = this._conversation.current(true)!;
            } else {
                segment = this._conversation.next(true)!;
            }
//            if (segment.overnight) {
//               this._overnight = true;
//            } else
            if (segment.clear) {
                this._setText(segment);
            } else {
                this.append(segment);
            }
            this.handleSegmentAudio(segment);
            return true;
        }
        return false;
    }
}
