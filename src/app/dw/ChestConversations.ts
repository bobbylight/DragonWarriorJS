import { Chest } from './Chest';
import RoamingState from './RoamingState';
import Conversation from './Conversation';

/**
 * Returns the text to display when the player opens a treasure chest.
 */
export default (state: RoamingState, chest: Chest | undefined): Conversation => {

    const conversation: Conversation = new Conversation(state.game, false);

    if (!chest) {
        conversation.addSegment('There is nothing to do here, \\w{hero.name}.');
        return conversation;
    }

    let gold: number;

    switch (chest.contentType) {

        case 'gold':
            gold = typeof chest.contents === 'number' ? chest.contents : chest.contents();
            conversation.addSegment({
                sound: 'openChest',
                text: `Of GOLD thou hast gained ${gold}.`,
                action: () => {
                    state.game.removeChest(chest);
                    state.game.party.gold += gold;
                }
            });
            break;

        case 'magicKey':
            conversation.addSegment({
                sound: 'openChest',
                text: 'Fortune smiles upon thee, \\w{hero.name}.',
                action: () => {
                    state.game.removeChest(chest);
                }
            });
            conversation.addSegment('Thou hast found the Magic Key');
            break;

        default:
            // TODO: See if we can validate at map load time and print better errors, e.g. unsupported value
            console.error(`Bad map data: unsupported chest contentType at ${chest.location}!`);
            conversation.addSegment('There is nothing to do here, \\w{hero.name}.');
            break;
    }

    return conversation;
};
