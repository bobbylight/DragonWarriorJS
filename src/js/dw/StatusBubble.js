function StatusBubble() {
   'use strict';
   var scale = game._scale;
   var tileSize = game.getTileSize();
   var w = 172 * scale;
   var x = game.getWidth() - tileSize - w;
   var y = tileSize * 3;
   var h = game.getHeight() - y - tileSize;
   Bubble.call(this, null, x, y, w, h);
   this.selection = 0;
}

StatusBubble.prototype = Object.create(Bubble.prototype, {
   
   _calculateX2Offs: {
      value: function(val) {
         'use strict';
         // We're assuming a string or a number here
         if (!val.length) {
            val = '' + val;
         }
         return game.stringWidth(val);
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
         
         game.drawString("NAME:", x, y0);
         var xOffs = this._calculateX2Offs(hero.name);
         game.drawString(hero.name, x2-xOffs, y0);
         y0 += Y_INC;
         
         game.drawString("STRENGTH:", x, y0);
         xOffs = this._calculateX2Offs(hero._strength);
         game.drawString(hero._strength, x2-xOffs, y0);
         y0 += Y_INC;
         
         game.drawString("AGILITY:", x, y0);
         xOffs = this._calculateX2Offs(hero.agility);
         game.drawString(hero.agility, x2-xOffs, y0);
         y0 += Y_INC;
         
         var attackPower = hero.getStrength();
         game.drawString("ATTACK POWER:", x, y0);
         xOffs = this._calculateX2Offs(attackPower);
         game.drawString(attackPower, x2-xOffs, y0);
         y0 += Y_INC;
         
         var defensePower = hero.getDefense();
         game.drawString("DEFENSE POWER:", x, y0);
         xOffs = this._calculateX2Offs(defensePower);
         game.drawString(defensePower, x2-xOffs, y0);
         y0 += Y_INC;
         
         var weaponName = hero.weapon ? hero.weapon.displayName : '';
         game.drawString("WEAPON:", x, y0);
         xOffs = this._calculateX2Offs(weaponName);
         game.drawString(weaponName, x2-xOffs, y0);
         y0 += Y_INC;
         
         var armorName = hero.armor ? hero.armor.displayName : '';
         game.drawString("ARMOR:", x, y0);
         xOffs = this._calculateX2Offs(armorName);
         game.drawString(armorName, x2-xOffs, y0);
         y0 += Y_INC;
         
         var shieldName = hero.shield ? hero.shield.displayName : '';
         game.drawString("SHIELD:", x, y0);
         xOffs = this._calculateX2Offs(shieldName);
         game.drawString(shieldName, x2-xOffs, y0);
         y0 += Y_INC;
         
      }
   }
   
});

StatusBubble.prototype.constructor = StatusBubble;
