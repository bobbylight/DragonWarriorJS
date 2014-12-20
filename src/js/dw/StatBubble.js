function StatBubble() {
   'use strict';
   var scale = game._scale;
   var tileSize = game.getTileSize();
   var w = 60 * scale;
   var h = 100 * scale;
   var x = tileSize;
   var y = tileSize;
   var title = game.hero.name;
   if (title.length > 4) {
      title = title.substring(0, 4);
   }
   Bubble.call(this, title, x, y, w, h);
   this.selection = 0;
}

StatBubble.prototype = Object.create(Bubble.prototype, {
   
   _calculateX2Offs: {
      value: function(val) {
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
         var x = this.x + Bubble.MARGIN;
         var x2 = this.x + this.w - Bubble.MARGIN;
         var y0 = y;
         var Y_INC = game.stringHeight() + 7*SCALE;
         var hero = game.hero;
         
         game.drawString("LV", x, y0);
         var xOffs = this._calculateX2Offs(hero.level);
         game.drawString(''+hero.level, x2-xOffs, y0);
         y0 += Y_INC;
         
         game.drawString("HP", x, y0);
         xOffs = this._calculateX2Offs(hero.hp);
         game.drawString(''+hero.hp, x2-xOffs, y0);
         y0 += Y_INC;
         
         game.drawString("MP", x, y0);
         xOffs = this._calculateX2Offs(hero.mp);
         game.drawString(''+hero.mp, x2-xOffs, y0);
         y0 += Y_INC;
         
         game.drawString("G", x, y0);
         xOffs = this._calculateX2Offs(hero.gold);
         game.drawString(''+hero.gold, x2-xOffs, y0);
         y0 += Y_INC;
         
         game.drawString("E", x, y0);
         xOffs = this._calculateX2Offs(hero.exp);
         game.drawString(''+hero.exp, x2-xOffs, y0);
         y0 += Y_INC;
         
      }
   }
   
});

StatBubble.prototype.constructor = StatBubble;
