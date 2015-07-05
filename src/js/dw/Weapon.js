dw.Weapon = function(name, args) {
   'use strict';
   this.name = name;
   this.baseCost = args.baseCost || 0;
   this.power = args.power || 1;
   this.displayName = args.displayName || this.name;
};

dw.Weapon.prototype = {
   
   toString: function() {
      'use strict';
      return '[dw.Weapon: ' +
         'name=' + this.name +
         ', baseCost=' + this.baseCost +
         ', power=' + this.power +
         ']';
   }
   
};

dw.Weapon.prototype.constructor = dw.Weapon;
