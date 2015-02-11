function Armor(name, args) {
   'use strict';
   this.name = name;
   this.baseCost = args.baseCost || 0;
   this.defense = args.defense || 1;
   this.displayName = args.displayName || this.name;
}

Armor.prototype = {
   
   toString: function() {
      'use strict';
      return '[Armor: ' +
         'name=' + this.name +
         ', baseCost=' + this.baseCost +
         ', defense=' + this.defense +
         ']';
   }
   
};

Armor.prototype.constructor = Armor;
