/* exported merchantConversationTemplate */
function merchantConversationTemplate(conversation, segmentArgs) {
   'use strict';
   
   return [
      {
         clear: false,
         text: segmentArgs.introText || 'Welcome! Would you like to see our wares?',
         afterSound: 'confirmation',
         choices: [
            { text: 'Yes', next: dw.Conversation.CHOICES_SEGMENT },
            { text: 'No', next: dw.Conversation.BID_FAREWELL_SEGMENT }
         ]
      },
      {
         id: dw.Conversation.CHOICES_SEGMENT, // This ID is special and required
         text: 'What dost thou wish to buy?',
         shopping: {
            choices: segmentArgs.choices
         }
      },
      {
         id: dw.Conversation.CONFIRM_SEGMENT,
         text: 'The \\w{item.name}? That will be \\w{item.baseCost} gold.  Is that okay?',
         afterSound: 'confirmation',
         choices: [
            { text: 'Yes', next: dw.Conversation.PURCHASE_SEGMENT },
            { text: 'No', next: dw.Conversation.DECLINED_PURCHASE_SEGMENT }
         ]
      },
      {
         id: dw.Conversation.PURCHASE_SEGMENT,
         action: function() {
            game.party.addInventoryItem(conversation.item);
            game.party.gold -= conversation.item.baseCost;
         },
         text: 'I thank thee!',
         next: dw.Conversation.SOMETHING_ELSE_SEGMENT
      },
      {
         id: dw.Conversation.NOT_ENOUGH_SEGMENT,
         text: "I'm afraid you do not have enough gold!"
      },
      {
         id: dw.Conversation.SOMETHING_ELSE_SEGMENT,
         text: 'Would you like to buy something else?',
         afterSound: 'confirmation',
         choices: [
            { text: 'Yes', next: dw.Conversation.CHOICES_SEGMENT },
            { text: 'No', next: dw.Conversation.BID_FAREWELL_SEGMENT }
         ]
      },
      {
         id: dw.Conversation.DECLINED_PURCHASE_SEGMENT,
         text: "I'm sorry to hear that.",
         next: dw.Conversation.SOMETHING_ELSE_SEGMENT
      },
      {
         id: dw.Conversation.BID_FAREWELL_SEGMENT,
         text: 'Please, come again.'
      }
   ];
   
}