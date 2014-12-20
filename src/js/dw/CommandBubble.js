function CommandBubble() {
   'use strict';
   var scale = game._scale;
   var tileSize = game.getTileSize();
   var w = 140 * scale;
   var h = 90 * scale;
   var x = game.getWidth() - tileSize - w;
   var y = tileSize;
   Bubble.call(this, "COMMAND", x, y, w, h);
   this.selection = 0;
}

CommandBubble.prototype = Object.create(Bubble.prototype, {
   
   handleCommandChosen: {
      value: function(/*RoamingState*/ screen) {
         'use strict';
         
         switch (this.selection) {
      
            case -1: // Canceled
               screen.startRoaming();
               break;
      
            case 0: // TALK
               screen.talkToNpc();
               break;
      
            case 1: // STATUS
               break;
      
            case 2: // STAIRS
               break;
      
            case 3: // SEARCH
               break;
      
            case 4: // SPELL
               break;
      
            case 5: // ITEM
               break;
      
            case 6: // DOOR
               break;
      
            case 7: // TAKE
               break;
      
         }
         
      }
   },
   
   handleInput: {
      
      value: function() {
         'use strict';
         
         var im = game.inputManager;
         
         if (im.up(true)) {
            this.selection = this.selection - 1;
            if (this.selection<0) {
               this.selection = 7;
            }
         }
      
         else if (im.down(true)) {
            this.selection = Math.floor((this.selection+1) % 8);
         }
      
         else if (this.selection>3 && im.left(true)) {
            this.selection -= 4;
         }
      
         else if (this.selection<4 && im.right(true)) {
            this.selection += 4;
         }
      
         else if (game.cancelKeyPressed()) {
            this.selection = -1;
            return true;
         }
      
         else if (game.actionKeyPressed()) {
            game.audio.playSound('menu');
            return true;
         }
      
         return false;
      
      }
   },
   
   paintContent: {
      
      value: function(ctx, y) {
         'use strict';
      
         var SCALE = game._scale;
         var x = this.x + 20*SCALE;
         var y0 = y;
         var Y_INC = game.stringHeight() + 7*SCALE;
      
         game.drawString("TALK", x, y0); y0 += Y_INC;
         game.drawString("STATUS", x, y0); y0 += Y_INC;
         game.drawString("STAIRS", x, y0); y0 += Y_INC;
         game.drawString("SEARCH", x, y0); y0 += Y_INC;
      
         x += 70 * SCALE;
         y0 -= 4*Y_INC;
         game.drawString("SPELL", x, y0); y0 += Y_INC;
         game.drawString("ITEM", x, y0); y0 += Y_INC;
         game.drawString("DOOR", x, y0); y0 += Y_INC;
         game.drawString("TAKE", x, y0); y0 += Y_INC;
      
         if (this.selection<4) {
            x -= 70 * SCALE;
         }
         x -= game.stringWidth(">") + 2*SCALE;
         y0 = y + Y_INC * (this.selection%4);
      
         game.drawArrow(x, y0); // DEL, but we use for our arrow
      
      }
   },
   
   reset: {
      value: function() {
         'use strict';
         this.selection = 0;
      }
   }

});

CommandBubble.prototype.constructor = CommandBubble;
