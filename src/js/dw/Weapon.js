function Weapon(name, args) {
   'use strict';
   this.name = name;
   this.baseCost = args.baseCost || 0;
   this.power = args.power || 1;
}

Weapon.prototype = {
   
   toString: function() {
      return '[weapon: ' +
         'name=' + this.name +
         ', baseCost=' + this.baseCost +
         ', power=' + this.power +
         ']';
   }
   
};

Weapon.prototype.constructor = Weapon;
