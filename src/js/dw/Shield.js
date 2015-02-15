function Shield(name, args) {
   'use strict';
   this.name = name;
   this.baseCost = args.baseCost || 0;
   this.defense = args.defense || 1;
   this.displayName = args.displayName || this.name;
}

Shield.prototype = {
   
   toString: function() {
      'use strict';
      return '[Shield: ' +
         'name=' + this.name +
         ', baseCost=' + this.baseCost +
         ', defense=' + this.defense +
         ']';
   }
   
};

Shield.prototype.constructor = Shield;
