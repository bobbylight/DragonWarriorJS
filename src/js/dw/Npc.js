dw.Npc = function(args) {
   'use strict';
   
   dw.RoamingEntity.call(this, args);
   gtp.Utils.mixin(args, this);
   
   this._origMapRow = this.mapRow;
   this._origMapCol = this.mapCol;
   this._origDir = this.direction;
   
   if (this.wanders) {
      this._stepDelay = new gtp.Delay({ millis: 3000, minDelta: -500, maxDelta: 500 });
      delete this.wanders;
   }
   
   //gtp.Utils.mixin(dw.RoamingEntityMixin.prototype, this);
   //dw.RoamingEntityMixin.call(this);
};

dw.Npc.prototype = Object.create(dw.RoamingEntity.prototype, {
   
   // TODO: Change NPC image to remove the need for this
   _computeColumn: {
      value: function() {
         'use strict';
         switch (this.direction) {
            case dw.Direction.NORTH:
               return 4;
            case dw.Direction.EAST:
               return 2;
            default:
            case dw.Direction.SOUTH:
               return 0;
            case dw.Direction.WEST:
               return 6;
         }
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
      
         if (this._stepDelay && this._stepDelay.update(delta)) {
            this._step();
            this._stepDelay.reset();
         }
         else {
            this.handleIsMovingInUpdate();
         }
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         var ss = game.assets.get('npcs');
         var ssRow = this.type;
         var ssCol = this._computeColumn();
         var x = this.mapCol * game.getTileSize();
   x -= game.getMapXOffs();
   x += this.xOffs;
         var y = this.mapRow * game.getTileSize();
   y -= game.getMapYOffs();
   y += this.yOffs;
         ssCol += dw.Hero.STEP_INC;
         ss.drawSprite(ctx, x,y, ssRow,ssCol);
      }
   },
   
   reset: {
      value: function() {
         'use strict';
         this.setMapLocation(this._origMapRow, this._origMapCol);
         this.direction = this._origDir;
         if (this._stepDelay) {
            this._stepDelay.reset();
         }
      }
   },
   
   setNpcIndex: {
      value: function(index) {
         'use strict';
         this.npcIndex = index;
      }
   },
   
   _step: {
      value: function() {
         'use strict';
         var dirFuncs = [ this.tryToMoveUp, this.tryToMoveDown,
               this.tryToMoveRight, this.tryToMoveLeft ];
         var triedToMove;
         while (!triedToMove) {
            var newDir = gtp.Utils.randomInt(0, 4);
            dirFuncs[newDir].call(this);
            // TODO: Provide means, in map or elsewhere, to restrict an NPC to
            // a specific region on the map.
            triedToMove = true;
         }
      }
   }
   
});

dw.Npc.prototype.constructor = dw.Npc;
