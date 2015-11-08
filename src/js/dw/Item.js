dw.Item = (function() {
   'use strict';
   
   var Item = function(name, args) {
      this.name = name;
      this.displayName = name;
      this.useFunc = args.use;
   };
   
   Item.prototype = {
      
      use: function() {
         return this.useFunc();
      },
      
      toString: function() {
         return '[dw.Item: ' +
            'name=' + this.name +
            ']';
      }
      
   };
   
   Item.prototype.constructor = Item;
   
   return Item;
   
})();

dw.Items = Object.freeze({
   
   HERB: new dw.Item('Herb', {
      use: function() {
         'use strict';
         game.hero.incHp(24);
      }
   }),
   
   KEY: new dw.Item('Key', {
      use: function() {
         'use strict';
         return game.state.openDoor();
      }
   }),
   
   TORCH: new dw.Item('Torch', {
      use: function() {
         'use strict';
         return game.setUsingTorch(true);
      }
   })
   
});
