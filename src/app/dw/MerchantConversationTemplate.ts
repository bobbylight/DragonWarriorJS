import Conversation from './Conversation';
import DwGame from './DwGame';
import { NpcText } from './mapLogic/MapLogic';
import { ConversationSegmentArgs } from './ConversationSegment';

export default (game: DwGame, conversation: Conversation, segmentArgs: ConversationSegmentArgs): NpcText => {

   if (!segmentArgs.choices) {
      throw 'No choices specified in conversation: ' + JSON.stringify(segmentArgs);
   }

   return [
      {
         clear: false,
         text: segmentArgs.introText || 'Welcome! Would you like to see our wares?',
         afterSound: 'confirmation',
         choices: [
            { text: 'Yes', next: Conversation.CHOICES_SEGMENT },
            { text: 'No', next: Conversation.BID_FAREWELL_SEGMENT }
         ]
      },
      {
         id: Conversation.CHOICES_SEGMENT, // This ID is special and required
         text: 'What dost thou wish to buy?',
         shopping: {
            choices: segmentArgs.choices as string[] // TODO: Verify this is just string[]
         }
      },
      {
         id: Conversation.CONFIRM_SEGMENT,
         text: 'The \\w{item.name}? That will be \\w{item.baseCost} gold.  Is that okay?',
         afterSound: 'confirmation',
         choices: [
            { text: 'Yes', next: Conversation.PURCHASE_SEGMENT },
            { text: 'No', next: Conversation.DECLINED_PURCHASE_SEGMENT }
         ]
      },
      {
         id: Conversation.PURCHASE_SEGMENT,
         action: () => {
            game.party.addInventoryItem(conversation.item);
            game.party.gold -= conversation.item.baseCost;
         },
         text: 'I thank thee!',
         next: Conversation.SOMETHING_ELSE_SEGMENT
      },
      {
         id: Conversation.NOT_ENOUGH_SEGMENT,
         text: "I'm afraid you do not have enough gold!"
      },
      {
         id: Conversation.SOMETHING_ELSE_SEGMENT,
         text: 'Would you like to buy something else?',
         afterSound: 'confirmation',
         choices: [
            { text: 'Yes', next: Conversation.CHOICES_SEGMENT },
            { text: 'No', next: Conversation.BID_FAREWELL_SEGMENT }
         ]
      },
      {
         id: Conversation.DECLINED_PURCHASE_SEGMENT,
         text: "I'm sorry to hear that.",
         next: Conversation.SOMETHING_ELSE_SEGMENT
      },
      {
         id: Conversation.BID_FAREWELL_SEGMENT,
         text: 'Please, come again.'
      }
   ];
};
