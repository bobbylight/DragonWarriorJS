dw.Armor = (function() {
   'use strict';
   
   var Armor = function(name, args) {
      this.name = name;
      this.baseCost = args.baseCost || 0;
      this.defense = args.defense || 1;
      this.displayName = args.displayName || this.name;
   };
   
   Armor.prototype = {
      
      toString: function() {
         return '[dw.Armor: ' +
            'name=' + this.name +
            ', baseCost=' + this.baseCost +
            ', defense=' + this.defense +
            ']';
      }
      
   };
   
   Armor.prototype.constructor = Armor;
   
   return Armor;
   
})();
