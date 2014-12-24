var EnemyAI = Object.freeze({
   
   attackOnly: function(hero, enemy) {
      'use strict';
      return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
   },
   
   get: function(id) {
      'use strict';
      if (EnemyAI[id]) {
         return EnemyAI[id];
      }
      console.error('Unknown EnemyAI: ' + id + '. Falling back on attackOnly');
      return this.attackOnly;
   }
   
});
