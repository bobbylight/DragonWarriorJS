function Weapon(name, args) {
   'use strict';
   this.name = name;
   this.baseCost = args.baseCost || 0;
   this.power = args.power || 1;
   this.displayName = args.displayName || this.name;
}

Weapon.prototype = {
   
   toString: function() {
      'use strict';
      return '[weapon: ' +
         'name=' + this.name +
         ', baseCost=' + this.baseCost +
         ', power=' + this.power +
         ']';
   }
   
};

Weapon.prototype.constructor = Weapon;