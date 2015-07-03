function Conversation() {
   'use strict';
   this._segments = [];
   this._responses = [];
}

Conversation.DONE = '_done';
Conversation.CHOICES_SEGMENT = 'choicesSegment';
Conversation.NOT_ENOUGH_SEGMENT = 'notEnoughGold';
Conversation.CONFIRM_SEGMENT = 'confirmPurchase';
Conversation.PURCHASE_SEGMENT = 'makePurchase';
Conversation.SOMETHING_ELSE_SEGMENT = 'somethingElse';
Conversation.BID_FAREWELL_SEGMENT = 'bidFarewell';

Conversation.prototype = (function() {
   'use strict';
   
   return {
      
      /**
       * Adds a segment to this conversation.
       * 
       * @param {Object} segmentArgs Arguments for a segment to add to this
       *        conversation.  This can also be a simple string for a single
       *        text segment.
       * @param {boolean} atCurIndex Whether to insert at the current index,
       *        as opposed to the end of the conversation.
       */
      addSegment: function(segmentArgs, atCurIndex) {
         if (segmentArgs.length) { // A string
            segmentArgs = { text: segmentArgs };
         }
         var segment = new ConversationSegment(this, segmentArgs);
         if (atCurIndex) {
            this._segments.splice(this._segmentIndex, 0, segment);
         }
         else {
            this._segments.push(segment);
         }
      },
      
      /**
       * Adds one or more segments to this conversation.
       * 
       * @param {Object[]} segmentArgs Either a single segment argument map, or
       *        an array of them.
       */
      setSegments: function(segmentArgs) {
         if (segmentArgs.conversationType) { // A Conversation object
            switch (segmentArgs.conversationType) {
               case 'merchant':
                  if (!segmentArgs.choices) {
                     throw 'No choices specified in conversation: ' + JSON.stringify(segmentArgs);
                  }
                  // Add the standard segments for a merchant.
                  // TODO: Allow user-defined segments to override these.
                  this.setSegments([
                     {
                        clear: false,
                        text: segmentArgs.introText || 'Welcome! Would you like to see our wares?',
                        choices: [
                           { text: 'Yes', next: Conversation.CHOICES_SEGMENT },
                           { text: 'No', next: Conversation.BID_FAREWELL_SEGMENT }
                        ]
                     },
                     {
                        id: Conversation.CHOICES_SEGMENT, // This ID is special and required
                        text: 'What dost thou wish to buy?',
                        shopping: {
                           choices: segmentArgs.choices
                        }
                     },
                     {
                        id: Conversation.CONFIRM_SEGMENT,
                        text: 'The \\w{item.name}? That will be \\w{item.baseCost}  gold.  Is that okay?',
                        choices: [
                           { text: 'Yes', next: Conversation.PURCHASE_SEGMENT },
                           { text: 'No', next: Conversation.CHOICES_SEGMENT }
                        ]
                     },
                     {
                        id: Conversation.PURCHASE_SEGMENT,
                        action: function() {
                           game.hero.gold -= this.item.baseCost;
                           console.log('TODO: Give hero the item, in this case: ' + JSON.stringify(this.item));
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
                        choices: [
                           { text: 'Yes', next: Conversation.CHOICES_SEGMENT },
                           { text: 'No', next: Conversation.BID_FAREWELL_SEGMENT }
                        ]
                     },
                     {
                        id: Conversation.BID_FAREWELL_SEGMENT, // This ID is special and required
                        text: 'Please, come again.'
                     }
                  ]);
                  break;
               default:
                  throw 'Unknown conversation type: ' + segmentArgs.conversationType;
            }
         }
         else if (Array.isArray(segmentArgs)) {
            var that = this;
            segmentArgs.forEach(function(args) {
               that.addSegment(args);
            });
         }
         else {
            this.addSegment(segmentArgs);
         }
      },
      
      start: function() {
         this._segmentIndex = 0;
         return this._segments[0];
      },
      
      _findIndexById: function(id) {
         for (var i=0; i<this._segments.length; i++) {
            if (this._segments[i].id === id) {
               return i;
            }
         }
         return this._segments.length;
      },
      
      _getNextIndex: function() {
         var current = this.current();
         if (!current) { // Already done
            return this._segments.length;
         }
         if (current.next) {
            if (current.next === Conversation.DONE) {
               return this._segments.length;
            }
            return this._findIndexById(current.next);
         }
         return this._segmentIndex + 1;
      },
      
      hasNext: function() {
         return this._getNextIndex() < this._segments.length;
      },
      
      current: function() {
         return this._segmentIndex >= this._segments.length ? null :
               this._segments[this._segmentIndex];
      },
      
      next: function() {
         var nextIndex = this._getNextIndex();
         if (nextIndex < this._segments.length) {
            this._segmentIndex = nextIndex;
            return this._segments[this._segmentIndex];
         }
         return null;
      },
      
      peekNext: function() {
         var nextIndex = this._getNextIndex();
         if (nextIndex < this._segments.length) {
            return this._segments[nextIndex];
         }
         return null;
      },
      
      setDialogueState: function(state) {
         if (!state) {
            // Assume we want the conversation to end
            this._segmentIndex = this._segments.length;
         }
         var index = this._findIndexById(state);
         if (index < this._segments.length) {
            this._segmentIndex = index;
            console.log('Set dialogue state to "' + state + '" (' + index + ')');
            return;
         }
         console.error('Unknown next dialogue state: "' + state + '"');
         this._segmentIndex = this._segments.length;
         return this._segmentIndex;
      },
      
      /**
       * If a purchase is being discussed, this method will be called with the
       * item being haggled over.  This allows us to refer to the item by name
       * and state its price.
       */
      setItem: function(item) {
         this.item = item;
      }
      
   };
   
})();