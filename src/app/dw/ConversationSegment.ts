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
 * For NPC chats more complex than static strings, this interface represents
 * the data that defines all possibilities.
 */
export interface ConversationSegmentArgs {
    action?: () => void;
    afterSound?: string;/*SoundEffect*/
    choices?: ConversationSegmentArgsChoice[];
    clear?: boolean;
    conversationType?: 'merchant' | 'innkeeper';
    cost?: number;
    id?: string;
    introText?: string;
    music?: string;
    next?: string;
    overnight?: boolean;
    shopping?: ShoppingInfo;
    sound?: string;/*SoundEffect*/
    text?: string;
}

export class ConversationSegment implements ConversationSegmentArgs {

    private readonly game: DwGame;
    parentConversation: Conversation;

    action?: () => void;
    afterSound?: string;/*SoundEffect*/
    choices?: ConversationSegmentArgsChoice[];
    clear?: boolean;
    id?: string;
    introText?: string;
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
