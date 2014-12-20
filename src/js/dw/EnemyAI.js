var EnemyAI = Object.freeze({
   
   attackOnly: function(hero, enemy) {
      return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
   },
   
   get: function(id) {
      if (EnemyAI[id]) {
         return EnemyAI[id];
      }
      console.error('Unknown EnemyAI: ' + id + '. Falling back on attackOnly');
      return attackOnly;
   }
   
});
