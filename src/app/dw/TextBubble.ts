import Bubble from './Bubble';
import DwGame from './DwGame';
import ShoppingBubble from './ShoppingBubble';
import QuestionBubble from './QuestionBubble';
import { Delay } from 'gtp';
import Conversation from './Conversation';
import ConversationSegment from './ConversationSegment';

export default class TextBubble extends Bubble {

    private _conversation: Conversation;
    private _text: string;
    private _curLine: number;
    private _lines: string[];
    private _delays: any[];
    private _curOffs: number;
    private _curCharMillis: number;
    private _textDone: boolean;
    private _questionBubble: QuestionBubble | null;
    private _shoppingBubble: ShoppingBubble | null;
    private _delay: Delay;
    private _doneCallbacks: any[];
    private _afterSound: any;
    private _overnight: boolean;

    static readonly CHAR_RENDER_MILLIS: number = 0;
    static readonly MAX_LINE_COUNT: number = 6;

    constructor(game: DwGame) {

        const tileSize: number = game.getTileSize();
        const x: number = tileSize;
        const width: number = game.getWidth() - 2 * x;
        const height: number = game.getTileSize() * 5;
        const y: number = game.getHeight() - tileSize - height;
        super(null, x, y, width, height);
        this._doneCallbacks = [];
    }

    addToConversation(text: any, autoAdvance: boolean = false): void {
        this._conversation.addSegment(text);

        if (autoAdvance && this._textDone) {
            this._updateConversation();
        } else {
            console.log('oh no - ' + autoAdvance + ', ' + this._textDone);
        }
    }

    _append(segment: any): void {

        const curText: string = segment.currentText();
        this._text = this._text + '\n' + curText;
        this._curLine = this._lines.length;
        const w: number = this.w - 2 * Bubble.MARGIN;
        const breakApartResult: any = this._breakApart(curText, w);
        this._lines = this._lines.concat(breakApartResult.lines);
        this._delays = breakApartResult.delays;
        this._curOffs = -1;
        this._curCharMillis = 0;
        this._textDone = false;
        console.log('>>> textDone set to false');
        if (segment.choices) {
            this._questionBubble = new QuestionBubble(this.game, segment.choices);
        } else if (segment.shopping) {
            this._shoppingBubble = new ShoppingBubble(this.game, segment.shopping);
        }
    }

    /**
     * Returns whether the user is "done" talking; that is, whether the entire
     * conversation has been rendered (including multiple pages, if necessary).
     */
    handleInput(): boolean {

        let result: any;
        let nextState: string;

        if (this._textDone) {
            if (this._shoppingBubble) {
                result = this._shoppingBubble.handleInput();
                if (result) {
                    const item: any = this._shoppingBubble.getSelectedItem();
                    delete this._shoppingBubble;
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
            } else if (this._questionBubble) {
                result = this._questionBubble.handleInput();
                if (result) {
                    nextState = this._questionBubble.getSelectedChoiceNextDialogue();
                    //this._conversation.setDialogueState(nextState);
                    delete this._questionBubble;
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
    _handleSegmentAudio(segment: any): void {
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
        return this._textDone && !this._questionBubble &&
            !this._shoppingBubble &&
            (!this._conversation || !this._conversation.hasNext());
    }

    currentTextDone(): boolean {
        return this._textDone;
    }

    isOvernight(): boolean {
        return this._overnight;
    }

    clearOvernight(overnight?: any): void {
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
            }
        } else if (this._shoppingBubble) {
            this._shoppingBubble.update(delta);
        } else if (this._questionBubble) {
            this._questionBubble.update(delta);
        }

        if (this._doneCallbacks.length > 0 && this.isDone()) {
            this._doneCallbacks.forEach((callback: Function) => {
                callback();
            });
            this._doneCallbacks = [];
        }

    }

    paintContent(ctx: CanvasRenderingContext2D, y: number): void {

        const x: number = this.x + Bubble.MARGIN;

        ctx.fillStyle = 'rgb(255,255,255)';
        if (this._lines) {
            for (let i: number = 0; i <= this._curLine; i++) {
                let text: string = this._lines[i];
                if (!this._textDone && i === this._curLine) {
                    const end: number = Math.max(0, this._curOffs);
                    text = text.substring(0, end);
                }
                this.game.drawString(text, x, y);
                y += 10 * this.game._scale;
            }
            if (this._textDone && this._conversation.hasNext()) {
                // TODO: Remove magic constants
                this.game.drawDownArrow(this.x + this.w - 30, this.y + this.h - 30);
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
            } else if (this._questionBubble) {
                this._questionBubble.paint(ctx);
            }
        }

    }

    /**
     * Renders text in this bubble.
     *
     * @param segment The text to render.
     */
    _setText(segment: any): void {
        this._text = segment.currentText();
        if (this._text) {
            const w: number = this.w - 2 * Bubble.MARGIN;
            const breakApartResult: any = this._breakApart(this._text, w);
            this._lines = breakApartResult.lines;
            this._delays = breakApartResult.delays;
            this._curLine = 0;
            this._curOffs = -1;
            this._curCharMillis = 0;
            this._textDone = false;
            console.log('>>> textDone set to false');
        }
        if (segment.choices) {
            this._questionBubble = new QuestionBubble(this.game, segment.choices);
        } else if (segment.shopping) {
            this._shoppingBubble = new ShoppingBubble(this.game, segment.shopping.choices);
        }
    }

    setConversation(conversation: Conversation): void {
        delete this._shoppingBubble;
        delete this._questionBubble;
        this._conversation = conversation;
        const segment: ConversationSegment = this._conversation.start();
        this._setText(segment);
        this._handleSegmentAudio(segment);
    }

    _updateConversation(forcedNextState: string | null = null): boolean {

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
                this._append(segment);
            }
            this._handleSegmentAudio(segment);
            return true;
        }
        return false;
    }
}
