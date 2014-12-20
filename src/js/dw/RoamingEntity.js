function RoamingEntity() {
   'use strict';
   
   this.direction = this.direction || Direction.SOUTH;
   this.mapCol = this.mapCol || 0;
   this.mapRow = this.mapRow || 0;
   this.xOffs = this.xOffs || 0;
   this.yOffs = this.yOffs || 0;
   this._stepTick = 0;
   // TODO: Make this time-dependant!
   this._moveInc = game._scale * (game._targetFps===30 ? 2 : 1);
}

RoamingEntity.prototype = {
   
   getMoveIncrement: function() {
      'use strict';
      return this._moveInc;
   },
   
   isMoving: function() {
      'use strict';
      return this.xOffs!==0 || this.yOffs!==0;
   },
   
   handleIsMovingInUpdate: function() {
      'use strict';
      if (this.isMoving()) {
         if (this.xOffs<0) {
            this.xOffs += this.getMoveIncrement();
         }
         else if (this.xOffs>0) {
            this.xOffs -= this.getMoveIncrement();
         }
         else if (this.yOffs<0) {
            this.yOffs += this.getMoveIncrement();
         }
         else if (this.yOffs>0) {
            this.yOffs -= this.getMoveIncrement();
         }
         if (!this.isMoving()) {
            this.handlePostMove();
         }
         
      }
      
   },
   
   handlePostMove: function() {
      // Do nothing; subclasses can override
   },
   
   /**
    * If this entity is only allowed to walk around in a certain range, this
    * method returns true iff the specified location is outside of that range.
    */
   _isOutOfRange: function(row, col) {
      'use strict';
      if (this.range) {
         return col<this.range[0] || col>this.range[2] ||
               row<this.range[1] || row>this.range[3];
      }
      return false;
   },
   
   setMapLocation: function(row, col) {
      'use strict';
      if (this.mapRow!=null && this.mapCol!=null) {
         var layer = game.getCollisionLayer();
         layer.setData(this.mapRow, this.mapCol, 0);
         if (row>-1 && col>-1) { // row===-1 && col===-1 => don't display
            layer.setData(row, col, 1);
         }
      }
      this.mapRow = row;
      this.mapCol = col;
      this.xOffs = this.yOffs = 0;
   },
   
   /**
    * Tries to move the player onto the specified tile.
    *
    * @param row
    * @param col
    * @return Whether the move was successful.
    */
   _tryToMove: function(row, col) {
      'use strict';
      
      if (this._isOutOfRange(row, col)) {
         return false;
      }
      
      var data = game.getCollisionLayer().getData(row, col);
      var canWalk = data===0;//-1;
      if (canWalk) {
         this.setMapLocation(row, col);
      }
      
      // TODO: Is there a better way to determine that I'm the hero?
      else if (data===361 && this.constructor.name==='Hero') { // i.e., not an NPC
         game.bump();
      }
      /*
      else {
         console.log("Can't walk (" + row + ", " + col + "): " + data);
      }
      */
      return canWalk;
   },
   
   
   tryToMoveLeft: function() {
      'use strict';
      var success = false;
      var col = this.mapCol - 1;
      if (col<0) {
         col += game.map.colCount;
      }
      if (this._tryToMove(this.mapRow, col)) {
         this.xOffs = game.getTileSize();
         success = true;
      }
      this.direction = Direction.WEST;
      return success;
   },
   
   tryToMoveRight: function() {
      'use strict';
      var success = false;
      var col = Math.floor((this.mapCol+1) % game.map.colCount);
      if (this._tryToMove(this.mapRow, col)) {
         this.xOffs = -game.getTileSize();
         success = true;
      }
      this.direction = Direction.EAST;
      return success;
   },
   
   tryToMoveUp: function() {
      'use strict';
      var success = false;
      var row = this.mapRow - 1;
      if (row<0) {
         row += game.map.rowCount;
      }
      if (this._tryToMove(row, this.mapCol)) {
         this.yOffs += game.getTileSize();
         success = true;
      }
      this.direction = Direction.NORTH;
      return success;
   },
   
   tryToMoveDown: function() {
      'use strict';
      var success = false;
      var row = Math.floor((this.mapRow+1) % game.map.rowCount);
      if (this._tryToMove(row, this.mapCol)) {
         this.yOffs -= game.getTileSize();
         success = true;
      }
      this.direction = Direction.SOUTH;
      return success;
   }
   
};
