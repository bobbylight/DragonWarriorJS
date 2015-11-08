dw.ItemBubble = function() {
   'use strict';
   var scale = game._scale;
   var tileSize = game.getTileSize();
   var w = 7 * tileSize;
   var h = 100 * scale;
   var x = 9 * tileSize;
   var y = 3 * tileSize;
   dw.Bubble.call(this, null, x, y, w, h);
   
   this._choices = game.party.getInventory().getItems();
   this._curChoice = 0;
};

dw.ItemBubble.prototype = Object.create(dw.Bubble.prototype, {
   
   _calculateX2Offs: {
      value: function(val) {
         'use strict';
         return game.stringWidth(''+val);
//         var digits = 1;
//         while (val > 10) {
//            digits++;
//            val /= 10;
//         }
//         return digits * 10 * game._scale;
      }
   },
   
   getAndRemoveSelectedItem: {
      value: function() {
         'use strict';
         if (this._curChoice === -1) {
            return null;
         }
         return this._choices.splice(this._curChoice, 1)[0];
      }
   },
   
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
   }
   
});

dw.ItemBubble.prototype.constructor = dw.ItemBubble;
