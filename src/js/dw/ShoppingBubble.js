dw.ShoppingBubble = function(game, shoppingInfo) {
   'use strict';
   var tileSize = game.getTileSize();
   var x = 5 * tileSize;
   var y = 1 * tileSize;
   var width = 9 * tileSize;
   var height = 6 * tileSize;
   dw.Bubble.call(this, null, x, y, width, height);
   
   this._choices = shoppingInfo.choices.map(function(choice) {
      return game.getWeapon(choice) || game.getArmor(choice) || game.getShield(choice);
   });
   
   this._curChoice = 0;
};

dw.ShoppingBubble.prototype = Object.create(dw.Bubble.prototype, {
   
   /**
    * Returns whether the user is "done" talking; that is, whether the entire
    * conversation has been rendered (including multiple pages, if necessary).
    */
   handleInput: {
      value: function() {
         'use strict';
         
         var im = game.inputManager;
         
         if (game.cancelKeyPressed()) {
            this._curChoice = -1;
            this._done = true;
            return true;
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
            game.drawString(this._choices[i].displayName, x, y);
            y += 10 * game._scale;
         }
         
      }
   },
   
   getSelectedItem: {
      value: function() {
         'use strict';
         return this._curChoice === -1 ? null :
               this._choices[this._curChoice];
      }
   },
   
   setChoices: {
      value: function(choices) {
         'use strict';
         this._choices = choices;
      }
   }
   
});

dw.ShoppingBubble.prototype.constructor = dw.ShoppingBubble;
