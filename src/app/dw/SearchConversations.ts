import { RoamingState } from './RoamingState';
import { Conversation } from './Conversation';
import { LocationString, toLocationString } from '@/app/dw/LocationString';
import { HERB } from '@/app/dw/Item';

/**
 * Returns the text to display when the player opens a treasure chest.
 */
export const getSearchConversation = (state: RoamingState): Conversation => {

    const conversation: Conversation = new Conversation(state.game, false);
    const game = state.game;
    conversation.addSegment('\\w{hero.name} searched the ground all about.');

    const location: LocationString = toLocationString(game.hero.mapRow, game.hero.mapCol);
    const chest: boolean = game.getMap().chests.has(location);

    // In this game, you must "TAKE" treasure, not "SEARCH" for it.
    if (chest) {
        conversation.addSegment('There is a treasure box.');
        return conversation;
    }

    const hiddenItem = game.getMap().hiddenItems.get(location);
    if (!hiddenItem) {
        conversation.addSegment('But there found nothing.');
        return conversation;
    }

    switch (hiddenItem.contentType) {
        case 'herb':
            conversation.addSegment({
                text: 'You found an herb!',
                action: () => {
                    game.removeHiddenItem(hiddenItem);
                    game.party.addInventoryItem(HERB);
                },
            });
            break;

        default:
            // TODO: See if we can validate at map load time and print better errors, e.g. unsupported value
            console.error(`Bad map data: unsupported hiddenItem type at ${hiddenItem.location}!`);
            conversation.addSegment('There is nothing to do here, \\w{hero.name}.');
            break;
    }

    return conversation;
};
