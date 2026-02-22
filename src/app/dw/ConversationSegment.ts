import { Utils } from 'gtp';
import { DwGame } from './DwGame';
import { Conversation } from './Conversation';

/**
 * Some conversations provide the user with a list of choices. These choices are
 * either static strings, or strings that map you to a specific step in the conversation
 * if they are selected. The former is typically used in shops, whereas the latter
 * is typically used in complex conversations where the user's choices dictate the
 * flow of the conversation.
 */
export type ConversationSegmentArgsChoice = string | ConversationSegmentArgsChoiceWithNextStep;

export interface ConversationSegmentArgsChoiceWithNextStep {
    text: string;
    next: string | (() => string);
}

/**
 * Template descriptor for merchant NPC conversations.
 */
export interface MerchantConversationArgs {
    conversationType: 'merchant';
    /** Item IDs to sell (e.g. 'bambooPole', 'club'). */
    choices: string[];
    /**
     * The merchant's greeting to the hero when they first arrive at the shop. If undefined,
     * a default is used.
     */
    introText?: string;
}

/**
 * Template descriptor for innkeeper NPC conversations.
 */
export interface InnkeeperConversationArgs {
    conversationType: 'innkeeper';
    cost: number;
}

/** Union of all NPC conversation template types. */
export type ConversationTemplate = MerchantConversationArgs | InnkeeperConversationArgs;

/**
 * For NPC chats more complex than static strings, this interface represents the data that defines all
 * possibilities. The best way to familiarize yourself with the structure is to look at the map data
 * in src/app/dw/mapLogic/.
 */
export interface ConversationSegmentArgs {
    /**
     * If defined, this callback is executed immediately when the segment first starts.
     */
    action?: () => void;

    /**
     * If defined, this callback is executed when the segment ends. It can optionally return additional segments
     * to append to the current conversation.
     */
    afterAction?: () => ConversationSegmentArgs[] | undefined;

    /**
     * If defined, an amount of time that is waited before automatically advancing to the next segment (not requiring
     * the player to press a button). This is often used with conversations representing actions such as battles, where
     * it can be used with "afterSound" to delay for the length of a sound effect, or slightly longer, as desired.
     */
    afterAutoAdvanceDelay?: number;

    /**
     * If defined, this sound effect is played after the segment finishes.
     */
    afterSound?: string;/*SoundEffect*/

    /**
     * A list of choices the hero can make in this segment. The choice list is displayed after the "text" is
     * displayed. This is used in conversations when the hero can make a choice (e.g. Yes/No => "But thou must!").
     */
    choices?: ConversationSegmentArgsChoice[];

    /**
     * If true, this segment will clear all prior text before rendering.
     */
    clear?: boolean;

    /**
     * The ID of this segment. Only needs to be defined if it needs to be referenced elsewhere, such as by another
     * segment's "next" field.
     */
    id?: string;

    /**
     * If defined, this music is played immediately when this segment starts.
     */
    music?: string;

    /**
     * If defined, the conversation should jump to this segment (by "id") next. If undefined, the next
     * segment in the conversation's array is used. See also Conversation.DONE.
     */
    next?: string;

    /**
     * Currently only used in when conversationType == 'innkeeper'. If true, after the segment finishes,
     * the game plays the overnight jingle and fades out, then back in, simulating staying overnight.
     */
    overnight?: boolean;

    /**
     * If defined, after this segment's text completes, the hero is shown a shopping bubble with the
     * items specified to choose from. This is currently used when conversationType == 'merchant'.
     */
    shopping?: ShoppingInfo;

    /**
     * If defined, this sound is played immediately when this segment starts.
     */
    sound?: string;/*SoundEffect*/

    /**
     * The text content of this segment. This should always be defined unless the conversationType is
     * defined to make this a template.
     */
    text?: string;
}

/**
 * A part of a conversation between the hero and an NPC, or between two NPCs. At its core, it represents some
 * text that the user must press an action key to advance past, but it also includes a lot of configurability -
 * tie sound effects to the text, add logic to run before or after the text renders, etc.
 */
export class ConversationSegment implements ConversationSegmentArgs {

    private readonly game: DwGame;
    parentConversation: Conversation;

    action?: () => void;
    afterAction?: () => ConversationSegmentArgs[] | undefined;
    afterAutoAdvanceDelay?: number;
    afterSound?: string;/*SoundEffect*/
    choices?: ConversationSegmentArgsChoice[];
    clear?: boolean;
    id?: string;
    music?: string;
    next?: string;
    overnight?: boolean;
    shopping?: ShoppingInfo;
    sound?: string;/*SoundEffect*/
    readonly text?: string;

    constructor(parentConversation: Conversation, game: DwGame, args: ConversationSegmentArgs) {

        this.parentConversation = parentConversation;
        this.game = game;
        Utils.mixin(args, this);
    }

    private getParameterizedText(): string | undefined {

        let text: string | undefined = this.text;
        if (!text) {
            return text;
        }

        // TODO: This could be much, much better
        let lbrace: number = text.indexOf('\\w{');
        while (lbrace > -1) {
            const rbrace: number = text.indexOf('}', lbrace + 3);
            if (rbrace > -1) {
                const expression: string = text.substring(lbrace + 3, rbrace);
                let expRemaining: string;
                let itemName: string;
                let itemCost: string;
                switch (expression) {
                    case 'hero.name':
                        text = text.substring(0, lbrace) + this.game.hero.name + text.substring(rbrace + 1);
                        lbrace = text.indexOf('\\w{', lbrace + this.game.hero.name.length);
                        break;
                    case 'hero.expRemaining':
                        expRemaining = this.game.hero.exp.toString(); // TODO: Correct value
                        text = text.substring(0, lbrace) + expRemaining + text.substring(rbrace + 1);
                        lbrace = text.indexOf('\\w{', lbrace + expRemaining.length);
                        break;
                    case 'item.name':
                        itemName = this.parentConversation.item?.displayName ?? '(error)';
                        text = text.substring(0, lbrace) + itemName + text.substring(rbrace + 1);
                        lbrace = text.indexOf('\\w{', lbrace + itemName.length);
                        break;
                    case 'item.baseCost':
                        itemCost = this.parentConversation.item?.baseCost.toString() ?? '(error)';
                        text = `${text.substring(0, lbrace)}${itemCost}${text.substring(rbrace + 1)}`;
                        lbrace = text.indexOf('\\w{', lbrace + itemCost.length);
                        break;
                    default:
                        console.error('Unknown token in NPC text: ' + expression);
                        lbrace = -1;
                        break;
                }
            }
        }

        return text;
    }

    currentText(): string | undefined {
        return this.getParameterizedText();
    }
}

export interface ShoppingInfo {
    choices: string[];
}
