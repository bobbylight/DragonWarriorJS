dw.Conversation = function() {
   'use strict';
   this._segments = [];
   this._responses = [];
};

dw.Conversation.DONE = '_done';
dw.Conversation.CHOICES_SEGMENT = 'choicesSegment';
dw.Conversation.NOT_ENOUGH_SEGMENT = 'notEnoughGold';
dw.Conversation.CONFIRM_SEGMENT = 'confirmPurchase';
dw.Conversation.PURCHASE_SEGMENT = 'makePurchase';
dw.Conversation.SOMETHING_ELSE_SEGMENT = 'somethingElse';
dw.Conversation.BID_FAREWELL_SEGMENT = 'bidFarewell';

dw.Conversation.prototype = (function() {
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
         var segment = new dw.ConversationSegment(this, segmentArgs);
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
         if (segmentArgs.conversationType) { // A dw.Conversation object
            switch (segmentArgs.conversationType) {
               case 'merchant':
                  if (!segmentArgs.choices) {
                     throw 'No choices specified in conversation: ' + JSON.stringify(segmentArgs);
                  }
                  // Add the standard segments for a merchant.
                  // TODO: Allow user-defined segments to override these.
                  this.setSegments(merchantConversationTemplate(this, segmentArgs));
                  break;
               case 'innkeeper':
                  if (!segmentArgs.cost) {
                     throw 'No cost for the inn specified in conversation: ' + JSON.stringify(segmentArgs);
                  }
                  // Add the standard segments for an innkeeper.
                  // TODO: Allow user-defined segments to override these.
                  this.setSegments(innkeeperConversationTemplate(this, segmentArgs));
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
            if (current.next === dw.Conversation.DONE) {
               return this._segments.length;
            }
            return this._findIndexById(current.next);
         }
         return this._segmentIndex + 1;
      },
      
      hasNext: function() {
         return this._getNextIndex() < this._segments.length;
      },
      
      current: function(performAction) {
         var segment = this._segmentIndex >= this._segments.length ? null :
               this._segments[this._segmentIndex];
         if (performAction && segment && segment.action) {
            segment.action();
         }
         return segment;
      },
      
      next: function(performAction) {
         var nextIndex = this._getNextIndex();
         if (nextIndex < this._segments.length) {
            this._segmentIndex = nextIndex;
            var segment = this._segments[this._segmentIndex];
            if (performAction && segment && segment.action) {
               segment.action();
            }
            return segment;
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