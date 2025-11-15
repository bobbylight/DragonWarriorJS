import DwGame from './DwGame';
import { NpcText } from './mapLogic/MapLogic';
import { ConversationSegmentArgs } from './ConversationSegment';

/**
 * Returns an NPC conversation with a merchant.
 *
 * @param game
 * @param segmentArgs
 */
export default (game: DwGame, segmentArgs: ConversationSegmentArgs): NpcText => {

   if (!segmentArgs.cost) {
      throw new Error(`No cost for the inn specified in conversation: ${JSON.stringify(segmentArgs)}`);
   }

   return [
      {
         clear: false,
         text: `Welcome to the traveler's inn. Room and board ${segmentArgs.cost} GOLD per night. Dost thou want a room?`,
         choices: [
            { text: 'Yes', next: 'stay' },
            { text: 'No', next: 'leave' },
         ],
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
            game.party.gold -= segmentArgs.cost!;
         },
      },
      { text: 'I shall see thee again.', next: '_done' },
      {
         id: 'leave',
         text: 'I shall see thee again.',
      },
   ];
};
