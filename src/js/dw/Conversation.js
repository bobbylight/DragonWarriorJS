function Conversation() {
   'use strict';
   this._segments = [];
   this._responses = [];
}

Conversation.prototype = (function() {
   'use strict';
   
   function parameterize(segment) {
      var text = segment.text;
      // TODO: This could be much, much better
      var lbrace = text.indexOf('{');
      while (lbrace > -1) {
         var rbrace = text.indexOf('}', lbrace+1);
         if (rbrace > -1) {
            var expression = text.substring(lbrace+1, rbrace);
            if (expression === 'hero.name') {
               text = text.substring(0, lbrace) + game.hero.name + text.substring(rbrace+1);
               lbrace = text.indexOf('{', lbrace+game.hero.name.length);
            }
            else {
               console.error('Unknown token in NPC text: ' + expression);
               lbrace = -1;
            }
         }
      }
      segment.text = text;
   }
   
   return {
      
      /**
       * Adds a segment to this conversation.
       * 
       * @param {TalkSegment} segment A segment to add to this conversation.
       *        This can also be a simple string for a single text segment.
       */
      addSegment: function(segment) {
         if (segment.length) { // A string
            segment = { text: segment };
         }
         parameterize(segment);
         this._segments.push(segment);
      },
      
      /**
       * Adds one or more segments to this conversation.
       * 
       * @param {TalkSegment[]} segments Either a single segment, or an array
       *        of segments.
       */
      setSegments: function(segments) {
         if (Array.isArray(segments)) {
            for (var i=0; i<segments.length; i++) {
               this.addSegment(segments[i]);
            }
         }
         else {
            this.addSegment(segments);
         }
      },
      
      start: function() {
         this._segmentIndex = 0;
         return this.next();
      },
      
      hasNext: function() {
         return this._segmentIndex < this._segments.length;
      },
      
      next: function() {
         return this._segments[this._segmentIndex++];
      },
      
      setDialogueState: function(state) {
         if (!state) {
            // Assume we want the conversation to end
            this._segmentIndex = this._segments.length;
         }
         for (var i=0; i<this._segments.length; i++) {
            if (this._segments[i].id === state) {
               this._segmentIndex = i;
               return;
            }
         }
         console.error('Unknown next dialogue state: "' + state + '"');
         this._segmentIndex = this._segments.length;
      }
      
   };
   
})();