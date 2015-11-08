dw.Inventory = (function() {
   'use strict';
   
   var Inventory = function() {
      this._items = [];
   };
   
   Inventory.prototype = {
      
      getItems: function() {
         return this._items;
      },
      
      push: function(item) {
         this._items.push(item);
      },
      
      toString: function() {
         return '[Inventory: ' +
            'size=' + this._items.length +
            ']';
      }
      
   };
   
   Inventory.prototype.constructor = Inventory;
   
   return Inventory;
   
})();
