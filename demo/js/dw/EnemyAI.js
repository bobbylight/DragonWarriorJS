dw.EnemyAI = Object.freeze({
   
   attackOnly: function(hero, enemy) {
      'use strict';
      return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
   },
   
   get: function(id) {
      'use strict';
      if (dw.EnemyAI[id]) {
         return dw.EnemyAI[id];
      }
      console.error('Unknown dw.EnemyAI: ' + id + '. Falling back on attackOnly');
      return this.attackOnly;
   }
   
});
