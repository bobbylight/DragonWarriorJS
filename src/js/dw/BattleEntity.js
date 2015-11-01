dw.BattleEntity = function(args) {
   'use strict';
   args = args || {};
   this.hp = args.hp || 0;
   this.maxHp = args.hp || 0;
   this.mp = args.mp || 0;
   this.maxMp = args.mp || 0;
};

dw.BattleEntity.prototype = {
   
   isDead: function() {
      'use strict';
      return this.hp <= 0;
   },
   
   takeDamage: function(amount) {
      'use strict';
      this.hp = Math.max(0, this.hp - amount);
      return this.isDead();
   }
   
};