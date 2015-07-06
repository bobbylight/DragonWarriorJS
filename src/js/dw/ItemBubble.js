dw.ItemBubble = function() {
   'use strict';
   var scale = game._scale;
   var tileSize = game.getTileSize();
   var w = 7 * tileSize;
   var h = 100 * scale;
   var x = 9 * tileSize;
   var y = 3 * tileSize;
   dw.Bubble.call(this, null, x, y, w, h);
   this.selection = 0;
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
   
   handleInput: {
      value: function() {
         'use strict';
      }         
   },
   
   paintContent: {
      
      value: function(ctx, y) {
         'use strict';
      
         var SCALE = game._scale;
         var x = this.x + dw.Bubble.MARGIN;
         var y0 = y;
         var Y_INC = game.stringHeight() + 7*SCALE;
         
         var items = game.party.getInventory();
         items.forEach(function(item) {
            
            game.drawString(item.displayName, x, y0);
            y0 += Y_INC;
            
         });
         
      }
   }
   
});

dw.ItemBubble.prototype.constructor = dw.ItemBubble;
