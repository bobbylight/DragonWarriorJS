dw.Enemy = function(args) {
   'use strict';
   
   gtp.Utils.mixin(args, this);
   
   dw.BattleEntity.call(this, args); // TODO: Better way to do a mixin?
   gtp.Utils.mixin(dw.RoamingEntity.prototype, this);
   
   this.ai = dw.EnemyAI.get(this.ai);
};

dw.Enemy.prototype = Object.create(dw.BattleEntity.prototype, {
   
   computePhysicalAttackDamage: {
      value: function(hero) {
         'use strict';
         
         if (hero.getDefense() >= this.str) {
            return gtp.Utils.randomInt(0, Math.floor((this.str + 4) / 6)+1);
         }
         
         var temp = this.str - Math.floor(hero.getDefense() / 2);
         var min = Math.floor(temp / 4);
         var max = Math.floor(temp / 2);
         return gtp.Utils.randomInt(min, max+1);
      }
   },
   
   getImage: {
      value: function(hit) {
         'use strict';
         return game.assets.get(hit ? this.damagedImage : this.image);
      }
   },
   
   prepare: {
      value: function() {
         'use strict';
         
         // Convert arrays into a single value
         if (this.hp.length) {
            // hp can be an array of form [min, max], both inclusive
            this.hp = gtp.Utils.randomInt(this.hp[0], this.hp[1]+1);
         }
         
         return this;
      }
   }
   
});

dw.Enemy.prototype.constructor = dw.Enemy;
