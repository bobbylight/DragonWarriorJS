dw.Shield = function(name, args) {
   'use strict';
   this.name = name;
   this.baseCost = args.baseCost || 0;
   this.defense = args.defense || 1;
   this.displayName = args.displayName || this.name;
};

dw.Shield.prototype = {
   
   toString: function() {
      'use strict';
      return '[dw.Shield: ' +
         'name=' + this.name +
         ', baseCost=' + this.baseCost +
         ', defense=' + this.defense +
         ']';
   }
   
};

dw.Shield.prototype.constructor = dw.Shield;
