import ConversationSegment from './ConversationSegment';
import merchantConversationTemplate from './MerchantConversationTemplate';
import innkeeperConversationTemplate from './InnkeeperConversationTemplate';
import Item from './Item';

export default class Conversation {

    private readonly _segments: ConversationSegment[];
    private _segmentIndex: number;
    item: any;

    static readonly DONE: string = '_done';
    static readonly CHOICES_SEGMENT: string = 'choicesSegment';
    static readonly NOT_ENOUGH_SEGMENT: string = 'notEnoughGold';
    static readonly CONFIRM_SEGMENT: string = 'confirmPurchase';
    static readonly PURCHASE_SEGMENT: string = 'makePurchase';
    static readonly SOMETHING_ELSE_SEGMENT: string = 'somethingElse';
    static readonly DECLINED_PURCHASE_SEGMENT: string = 'declinedPurchase';
    static readonly BID_FAREWELL_SEGMENT: string = 'bidFarewell';

    constructor() {
        this._segments = [];
    }

    /**
     * Adds a segment to this conversation.
     *
     * @param segmentArgs Arguments for a segment to add to this
     *        conversation.  This can also be a simple string for a single
     *        text segment.
     * @param atCurIndex Whether to insert at the current index,
     *        as opposed to the end of the conversation.
     */
    addSegment(segmentArgs: any, atCurIndex: boolean = false) {
        if (segmentArgs.length) { // A string
            segmentArgs = {text: segmentArgs};
        }
        const segment: ConversationSegment = new ConversationSegment(this, segmentArgs);
        if (atCurIndex) {
            this._segments.splice(this._segmentIndex, 0, segment);
        } else {
            this._segments.push(segment);
        }
    }

    /**
     * Adds one or more segments to this conversation.
     *
     * @param segmentArgs Either a single segment argument map, or
     *        an array of them.
     */
    setSegments(segmentArgs: any) {
        if (segmentArgs.conversationType) { // A dw.Conversation object
            switch (segmentArgs.conversationType) {
                case 'merchant':
                    if (!segmentArgs.choices) {
                        throw 'No choices specified in conversation: ' + JSON.stringify(segmentArgs);
                    }
                    // Add the standard segments for a merchant.
                    // TODO: Allow user-defined segments to override these.
                    this.setSegments(merchantConversationTemplate(this, segmentArgs));
                    break;
                case 'innkeeper':
                    if (!segmentArgs.cost) {
                        throw 'No cost for the inn specified in conversation: ' + JSON.stringify(segmentArgs);
                    }
                    // Add the standard segments for an innkeeper.
                    // TODO: Allow user-defined segments to override these.
                    this.setSegments(innkeeperConversationTemplate(this, segmentArgs));
                    break;
                default:
                    throw 'Unknown conversation type: ' + segmentArgs.conversationType;
            }
        } else if (Array.isArray(segmentArgs)) {
            segmentArgs.forEach((args: any) => {
                this.addSegment(args);
            });
        } else {
            this.addSegment(segmentArgs);
        }
    }

    start(): ConversationSegment {
        this._segmentIndex = 0;
        return this._segments[0];
    }

    private _findIndexById(id: string): number {
        const index: number = this._segments.findIndex(segment => id === segment.id);
        return index !== -1 ? index : this._segments.length;
    }

    _getNextIndex(): number {
        const current: ConversationSegment | null = this.current();
        if (!current) { // Already done
            return this._segments.length;
        }
        if (current.next) {
            if (current.next === Conversation.DONE) {
                return this._segments.length;
            }
            return this._findIndexById(current.next);
        }
        return this._segmentIndex + 1;
    }

    hasNext(): boolean {
        return this._getNextIndex() < this._segments.length;
    }

    current(performAction: boolean = false): ConversationSegment | null {
        const segment: ConversationSegment | null = this._segmentIndex >= this._segments.length ? null :
            this._segments[this._segmentIndex];
        if (performAction && segment && segment.action) {
            segment.action();
        }
        return segment;
    }

    next(performAction: boolean): ConversationSegment | null {
        const nextIndex: number = this._getNextIndex();
        if (nextIndex < this._segments.length) {
            this._segmentIndex = nextIndex;
            const segment: ConversationSegment | null = this._segments[this._segmentIndex];
            if (performAction && segment && segment.action) {
                segment.action();
            }
            return segment;
        }
        return null;
    }

    peekNext(): ConversationSegment | null {
        const nextIndex: number = this._getNextIndex();
        if (nextIndex < this._segments.length) {
            return this._segments[nextIndex];
        }
        return null;
    }

    setDialogueState(state: string): number {
        if (!state) {
            // Assume we want the conversation to end
            this._segmentIndex = this._segments.length;
        }
        const index: number = this._findIndexById(state);
        if (index < this._segments.length) {
            this._segmentIndex = index;
            console.log('Set dialogue state to "' + state + '" (' + index + ')');
            return this._segmentIndex;
        }
        console.error('Unknown next dialogue state: "' + state + '"');
        this._segmentIndex = this._segments.length;
        return this._segmentIndex;
    }

    /**
     * If a purchase is being discussed, this method will be called with the
     * item being haggled over.  This allows us to refer to the item by name
     * and state its price.
     */
    setItem(item: Item) {
        this.item = item;
    }

}
