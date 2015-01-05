function Weapon(args) {
   'use strict';
   this.baseCost = 0;
   this.power = 1;
}

Weapon.prototype = {
   
   toString: function() {
      return '[weapon: ' +
         'baseCost=' + this.baseCost +
         ', power=' + this.power +
         ']';
   }
   
};

Weapon.prototype.constructor = Weapon;
