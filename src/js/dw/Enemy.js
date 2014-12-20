function Enemy(args) {
   'use strict';
   
   gtp.Utils.mixin(args, this);
   
   BattleEntity.call(this, args); // TODO: Better way to do a mixin?
   gtp.Utils.mixin(RoamingEntity.prototype, this);
   
   this.ai = EnemyAI.get(this.ai);
}

Enemy.prototype = Object.create(BattleEntity.prototype, {
   
   computePhysicalAttackDamage: {
      value: function(hero) {
         if (hero.defense >= this.str) {
            return gtp.Utils.randomInt(0, Math.floor((this.str + 4) / 6));
         }
         
         var temp = this.str - hero.defense/2;
         var min = Math.floor(temp / 4);
         var max = Math.floor(temp / 2);
         return gtp.Utils.randomInt(min, max);
      }
   },
   
   getImage: {
      value: function(hit) {
         'use strict';
         return game.assets.get(hit ? this.damagedImage : this.image);
      }
   }
      
});

Enemy.prototype.constructor = Enemy;
