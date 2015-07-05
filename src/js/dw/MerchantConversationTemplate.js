/* exported merchantConversationTemplate */
function merchantConversationTemplate(conversation, segmentArgs) {
   'use strict';
   
   return [
      {
         clear: false,
         text: segmentArgs.introText || 'Welcome! Would you like to see our wares?',
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
         choices: [
            { text: 'Yes', next: dw.Conversation.PURCHASE_SEGMENT },
            { text: 'No', next: dw.Conversation.CHOICES_SEGMENT }
         ]
      },
      {
         id: dw.Conversation.PURCHASE_SEGMENT,
         action: function() {
            game.hero.gold -= conversation.item.baseCost;
            console.log('TODO: Give hero the item, in this case: ' + JSON.stringify(conversation.item));
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
         choices: [
            { text: 'Yes', next: dw.Conversation.CHOICES_SEGMENT },
            { text: 'No', next: dw.Conversation.BID_FAREWELL_SEGMENT }
         ]
      },
      {
         id: dw.Conversation.BID_FAREWELL_SEGMENT,
         text: 'Please, come again.'
      }
   ];
   
}
