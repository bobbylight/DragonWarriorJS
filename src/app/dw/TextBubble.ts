import { Delay } from 'gtp';
import { Bubble,BreakApartDelay, BreakApartResult } from './Bubble';
import { DwGame } from './DwGame';
import { ShoppingBubble } from './ShoppingBubble';
import { Conversation } from './Conversation';
import { ConversationSegment,
    ConversationSegmentArgs,
    ConversationSegmentArgsChoice,
} from './ConversationSegment';
import { ChoiceBubble } from './ChoiceBubble';
import { Sellable } from './Sellable';

type DoneCallback = () => void;

export class TextBubble extends Bubble {

    private conversation: Conversation;
    private conversationDone: boolean;
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
    private afterAutoAdvanceDelay: number;
    private inAutoAdvanceDelay: boolean;
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

        this.conversation = new Conversation(game);
        this.conversationDone = false;
        this.text = '';
        this.curLine = 0;
        this.lines = [];
        this.delays = [];
        this.curOffs = -1;
        this.curCharMillis = 0;
        this.textDone = true;
        this.doneCallbacks = [];
        this.afterAutoAdvanceDelay = 0;
        this.inAutoAdvanceDelay = false;
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
        const w: number = this.w - 2 * this.getXMargin();
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

        return new ChoiceBubble(this.game, x, y, width, height, choices, (choice) => {
            if (typeof choice === 'string') {
                return choice;
            }
            return choice.text;
        });
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
                    delete this.choiceBubble;
                    this.setActive(true);
                    return !this.updateConversation(nextState);
                }
                return false;
            }
        }

        // A little cheap, but we currently don't support pressing a key to auto-advance text when an
        // auto-advance delay is pending or running. This could be implemented in the future but might be a little
        // complex.
        if (this.game.anyKeyDown() && !this.hasPendingOrRunningAutoAdvanceDelay()) {
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
     * Initializes local state based on the upcoming conversation segment.
     */
    handleSegmentExtraProperties(segment: ConversationSegment): void {
        // Sound or music to play immediately
        if (segment.sound) {
            this.game.audio.playSound(segment.sound);
        }
        if (segment.music) {
            this.game.audio.playMusic(segment.music);
        }

        // A sound to play when this segment's text finishes rendering
        if (segment.afterSound) {
            this.afterSound = segment.afterSound;
        } else if (segment.choices) {
            this.afterSound = 'confirmation';
        }

        this.afterAutoAdvanceDelay = segment.afterAutoAdvanceDelay ?? 0;
        this.inAutoAdvanceDelay = false;
    }

    /**
     * Returns true if there is a pending or running auto-advance delay. Used to disallow the player from
     * auto-advancing text when a delay is imminent. In practice this should be allowed, skipping just to the
     * delay, but we'll add that in a future ticket.
     */
    private hasPendingOrRunningAutoAdvanceDelay(): boolean {
        return this.afterAutoAdvanceDelay > 0 || this.inAutoAdvanceDelay;
    }

    override init() {
        super.init();
        this.conversationDone = false;
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
                        this.delay = new Delay({ millis: elem.millis });
                        return;
                    }
                }
                this.curOffs++;
                if (this.curOffs === this.lines[this.curLine].length) {
                    if (this.curLine === this.lines.length - 1) {
                        if (this.afterSound) {
                            this.game.audio.playSound(this.afterSound);
                            delete this.afterSound;
                        }
                        if (this.afterAutoAdvanceDelay > 0) {
                            this.inAutoAdvanceDelay = true;
                            this.delay = new Delay({
                                millis: this.afterAutoAdvanceDelay,
                                callback: () => {
                                    console.log('Setting textDone to true');
                                    this.textDone = true;
                                    this.inAutoAdvanceDelay = false;
                                    this.updateConversation();
                                },
                            });
                            this.afterAutoAdvanceDelay = 0;
                        } else {
                            console.log('Setting textDone to true');
                            this.textDone = true;
                        }
                    } else {
                        console.log('Going to next line');
                        this.curLine++;
                        this.curOffs = -1;
                    }
                } else if (this.conversation.getVoice() &&
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
            const w: number = this.w - 2 * this.getXMargin();
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
        this.handleSegmentExtraProperties(segment);
    }

    private updateConversation(forcedNextState?: string): boolean {

        if (this.conversationDone) {
            return false;
        }

        const prevSegment = this.conversation.current();
        if (prevSegment) {
            if (prevSegment.overnight && this.textDone) {
                this.overnight = true;
            }
            const segmentsToAdd = prevSegment.afterAction?.();
            if (prevSegment.afterAction && !segmentsToAdd && !this.conversation.hasNext()) {
                this.conversation.next();
                this.conversationDone = true;
                return false;
            }
            segmentsToAdd?.forEach((segment) => {
                this.conversation.addSegment(segment);
                this.textDone = false;
            });
        }

        if (forcedNextState || this.conversation.hasNext()) {
            let segment: ConversationSegment;
            if (forcedNextState) {
                segment = this.conversation.setDialogueState(forcedNextState)!;
            } else {
                segment = this.conversation.next()!;
            }
            segment.action?.();
            if (segment.clear) {
                this.setText(segment);
            } else {
                this.append(segment);
            }
            this.handleSegmentExtraProperties(segment);
            return true;
        }
        this.conversationDone = true;
        return false;
    }
}
