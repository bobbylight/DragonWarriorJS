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
      throw `No cost for the inn specified in conversation: ${JSON.stringify(segmentArgs)}`;
   }

   return [
      {
         clear: false,
         text: `Welcome to the inn.  Our price is ${segmentArgs.cost} gold per night.  Wilst thou stay?`,
         afterSound: 'confirmation',
         choices: [
            { text: 'Yes', next: 'stay' },
            { text: 'No',  next: 'leave' }
         ]
      },
      {
         id: 'stay',
         text: 'Have a good night!',
         overnight: true
      },
      {
         text: 'I hope you had a good night.',
         action: () => {
            game.party.replenishHealthAndMagic();
            game.party.gold -= segmentArgs.cost!;
         }
      },
      { text: 'I shall see thee again.', next: '_done' },
      {
         id: 'leave',
         text: 'I shall see thee again.'
      }
   ];
};
