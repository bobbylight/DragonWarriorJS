dw.QuestionBubble = function(game, choices) {
   'use strict';
   var tileSize = game.getTileSize();
   var x = game.getWidth() - tileSize * 6;
   var y = tileSize;
   var width = tileSize * 5;
   var height = tileSize * 5;
   dw.Bubble.call(this, null, x, y, width, height);
   
   this._choices = choices;
   this._curChoice = 0;
};

dw.QuestionBubble.prototype = Object.create(dw.Bubble.prototype, {
   
   /**
    * Returns whether the user is "done" talking; that is, whether the entire
    * conversation has been rendered (including multiple pages, if necessary).
    */
   handleInput: {
      value: function() {
         'use strict';
         
         var im = game.inputManager;
         
         if (game.cancelKeyPressed()) {
            this._curChoice = 0;
         }
         else if (game.actionKeyPressed()) {
            this._done = true;
            return true;
         }
         else if (im.up(true)) {
            this._curChoice = Math.max(0, this._curChoice-1);
         }
         else if (im.down(true)) {
            this._curChoice = Math.min(this._curChoice+1, this._choices.length-1);
         }
         
         return false;
      }
   },
   
   paintContent: {
      value: function(ctx, y) {
         'use strict';
         
         var x = this.x + dw.Bubble.MARGIN + 10*game._scale;
         
         ctx.fillStyle = 'rgb(255,255,255)';
         for (var i=0; i<this._choices.length; i++) {
            if (this._curChoice === i) {
               game.drawArrow(this.x + dw.Bubble.MARGIN, y);
            }
            game.drawString(this._choices[i].text, x, y);
            y += 10 * game._scale;
         }
         
      }
   },
   
   getSelectedChoiceNextDialogue: {
      value: function() {
         'use strict';
         var choice = this._choices[this._curChoice];
         if (choice.next) {
            // Just a string id of the next dialogue, or a function
            return choice.next.length ? choice.next : choice.next();
         }
         return null;
      }
   },
   
   setChoices: {
      value: function(choices) {
         'use strict';
         this._choices = choices;
      }
   }
   
});

dw.QuestionBubble.prototype.constructor = dw.QuestionBubble;
