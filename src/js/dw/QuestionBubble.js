function QuestionBubble(game, choices) {
   'use strict';
   var scale = game._scale;
   var margin = Bubble.MARGIN*scale;
   var x = 200 * scale;
   var y = 20 * scale;
   var width = game.getWidth() - 2*margin;
   var height = game.getTileSize() * 5;
   Bubble.call(this, null, x, y, width, height);
   
   this._choices = choices;
   this._curChoice = 0;
}

QuestionBubble.prototype = Object.create(Bubble.prototype, {
   
   /**
    * Returns whether the user is "done" talking; that is, whether the entire
    * conversation has been rendered (including multiple pages, if necessary).
    */
   handleInput: {
      value: function() {
         'use strict';
         if (game.cancelKeyPressed()) {
            this._curChoice = 0;
         }
         else if (game.actionKeyPressed()) {
            this._done = true;
            return true;
         }
         return false;
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
         
         var im = game.inputManager;
         
         if (im.up(true)) {
            this._curChoice = Math.max(0, this._curChoice-1);
         }
         else if (im.down(true)) {
            this._curChoice = Math.min(this._curChoice+1, this._choices.length-1);
         }
         
      }
   },
   
   paintContent: {
      value: function(ctx, y) {
         'use strict';
         
         var x = this.x + Bubble.MARGIN + 10*game._scale;
         
         ctx.fillStyle = 'rgb(255,255,255)';
         for (var i=0; i<this._choices.length; i++) {
            if (this._curChoice === i) {
               game.drawArrow(this.x + Bubble.MARGIN, y);
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

QuestionBubble.prototype.constructor = QuestionBubble;
