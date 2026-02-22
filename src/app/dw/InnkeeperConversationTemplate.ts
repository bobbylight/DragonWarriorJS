import { DwGame } from './DwGame';
import { NpcText } from './mapLogic/MapLogic';
import { InnkeeperConversationArgs } from './ConversationSegment';
import { Conversation } from '@/app/dw/Conversation';

/**
 * Returns an NPC conversation with a merchant.
 *
 * @param game
 * @param segmentArgs
 */
export const innkeeperConversationTemplate = (game: DwGame, segmentArgs: InnkeeperConversationArgs): NpcText => {

    const cost = segmentArgs.cost;

    return [
        {
            clear: false,
            text: `Welcome to the traveler's inn. Room and board ${cost} GOLD per night. Dost thou want a room?`,
            choices: [
                {
                    text: 'Yes',
                    next: () => {
                        const canAffordIt = game.party.gold >= cost;
                        return canAffordIt ? 'stay' : 'cantAffordIt';
                    },
                },
                { text: 'No', next: 'leave' },
            ],
        },
        {
            id: 'cantAffordIt',
            text: 'Thou hast not enough money.',
            next: Conversation.DONE,
        },
        {
            id: 'stay',
            text: 'Have a good night!',
            overnight: true,
        },
        {
            text: 'I hope you had a good night.',
            action: () => {
                game.party.replenishHealthAndMagic();
                game.party.gold -= cost;
            },
        },
        { text: 'I shall see thee again.', next: Conversation.DONE },
        {
            id: 'leave',
            text: 'Okay.\nGood-bye, traveler.',
        },
    ];
};
