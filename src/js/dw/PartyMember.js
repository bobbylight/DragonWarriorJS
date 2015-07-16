dw.PartyMember = function(args) {
   'use strict';
   dw.RoamingEntity.call(this, args);
   
   this.name = args.name;
   this.level = 1;
   this.exp = 12345;
   
   this._strength = 4;
   //this.defense = 10;
   this.agility = 4;
   
   this.hp = args.hp || 1234;
   this.maxHp = args.hp || 0;
   this.mp = args.mp || 0;
   this.maxMp = args.mp || 0;
   
   //dw.BattleEntity.call(this, args); // TODO: Better way to do a mixin?
   //gtp.Utils.mixin(dw.RoamingEntityMixin.prototype, this);
   //dw.BattleEntityMixin.call(this);
   
};

dw.PartyMember.prototype = Object.create(dw.RoamingEntity.prototype, {
   
   computePhysicalAttackDamage: {
      value: function(enemy) {
         'use strict';
         
         var strength = this.getStrength(),
               min, max;
         if (!enemy.cannotBeExcellentMoved && this._getPerformExcellentMove()) {
            min = Math.floor(strength / 2);
            max = this._strength;
         }
         else {
            var temp = strength - enemy.agility/2;
            min = Math.floor(temp / 4);
            max = Math.floor(temp / 2);
         }
         
         var damage = gtp.Utils.randomInt(min, max+1);
         if (damage < 1) {
            damage = gtp.Utils.randomInt(0, 2)===0 ? 1 : 0;
         }
         return damage;
      }
   },
   
   getDefense: {
      value: function() {
         'use strict';
         var defense = Math.floor(this.agility / 2);
         if (this.armor) {
            defense += this.armor.defense;
         }
         if (this.shield) {
            defense += this.shield.defense;
         }
         return defense;
      }
   },
   
   _getPerformExcellentMove: {
      value: function() {
         'use strict';
         return gtp.Utils.randomInt(0, 32) === 0;
      }
   },
   
   getStrength: {
      value: function() {
         'use strict';
         return this._strength + (this.weapon ? this.weapon.power : 0);
      }
   },
   
   /**
    * Called when this entity intersects an object on the map.  The default
    * implementation does nothing; subclasses can override.
    */
   handleIntersectedObject: {
      value: function(/*TiledObject*/ obj) {
         'use strict';
         // Do nothing
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
         
         this._stepTick += delta;
         if (this._stepTick>=600) {
            this._stepTick -= 600;
            dw.Hero.STEP_INC = 0;
         }
         else if (this._stepTick>=300) {
            dw.Hero.STEP_INC = 1;
         }
         
         this.handleIsMovingInUpdate();
      
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         var tileSize = game.getTileSize();
         
         // TODO: Move SpriteSheets to AssetManager or somewhere else
         if (!this.spriteSheet) {
            this.spriteSheet = game.assets.get('hero');
         }
         
         var ssRow = 0, ssCol = 0;
         switch (this.direction) {
            case dw.Direction.NORTH:
               ssCol = 4;
               break;
            case dw.Direction.SOUTH:
               //ssCol = 0;
               break;
            case dw.Direction.EAST:
               ssCol = 6;
               break;
            case dw.Direction.WEST:
               ssCol = 2;
               break;
         }
         ssCol += dw.Hero.STEP_INC;
         
         var x = (game.canvas.width - tileSize)/2;
         var y = (game.canvas.height - tileSize)/2;
         this.spriteSheet.drawSprite(ctx, x,y, ssRow, ssCol);
      //   ctx.drawImage(img, imgX,imgY,tileSize,tileSize, x,y,tileSize,tileSize);
      
      }
   },
   
   handlePostMove: {
      value: function() {
         'use strict';
         
         // See if we're supposed to warp to another map
         var warpLayer = game.map.getLayer('warpLayer');
         var tileSize = game.getTileSize();
         var x = this.mapCol * tileSize;
         var y = this.mapRow * tileSize;
         
         var obj = warpLayer.getObjectIntersecting(x, y, tileSize, tileSize);
         if (obj) {
            this.handleIntersectedObject(obj);
         }

         // See if we should fight a monster
         else {
            this._possiblyStartRandomEncounter();
         }
      }
   },
   
   /**
    * Adds HP to this entity's total, making sure to not exceed its maximum
    * HP value.  The inverse of this method is <code>takeDamage</code>.
    *
    * @param {int} amount The amount of HP to add.
    * @return {boolean} Whether this entity is dead (has 0 HP).  This will
    *         only be possible if you pass a negative value to this method.
    * @see takeDamage
    */
   incHp: {
      value: function(amount) {
         'use strict';
         this.hp = Math.min(this.hp + amount, this.maxHp);
         this.hp = Math.max(0, this.hp);
         // TODO: Remove me, just for testing
         this.hp = Math.max(1, this.hp);
         return this.isDead();
      }
   },
   
   isDead: {
      value: function() {
         'use strict';
         return this.hp <= 0;
      }
   },
   
   _possiblyStartRandomEncounter: {
      value: function() {
         'use strict';
         if (game.randomInt(20)===0) {
            game.startRandomEncounter();
         }
      }
   },
   
   /**
    * Replenishes the HP and MP of this party member.
    */
   replenishHealthAndMagic: {
      value: function() {
         'use strict';
         this.hp = this.maxHp;
         this.mp = this.maxMp;
      }
   },
   
   /**
    * Subtracts HP from this entity's current amount.  This is the inverse
    * of <code>incHp</code>.
    * 
    * @param {int} amount The amount of hit points to deduct.
    * @return {boolean} Whether this entity is dead (has 0 HP).
    * @see incHp
    */
   takeDamage: {
      value: function(amount) {
         'use strict';
         this.incHp(-amount);
      }
   }
   
});

dw.PartyMember.prototype.constructor = dw.PartyMember;
