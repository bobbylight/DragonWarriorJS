import Direction from './Direction';
import DwGame from './DwGame';

export default class RoamingEntity {

    protected game: DwGame;
    direction: Direction;
    mapRow: number;
    mapCol: number;
    xOffs: number;
    yOffs: number;
    protected _stepTick: number;
    private _moveInc: number;
    protected range: number[];

    constructor(game: DwGame) {
        this.game = game;
        this.direction = this.direction || Direction.SOUTH;
        this.mapCol = this.mapCol || 0;
        this.mapRow = this.mapRow || 0;
        this.xOffs = this.xOffs || 0;
        this.yOffs = this.yOffs || 0;
        this._stepTick = 0;
        // TODO: Make this time-dependent!
        this._moveInc = game._scale * (game._targetFps===30 ? 2 : 1);
    }

   getMoveIncrement() {
      return this._moveInc;
   }
   
   handleIsMovingInUpdate() {
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
   }
   
   handlePostMove() {
      // Do nothing; subclasses can override
   }
   
   /**
    * Returns whether this entity is at the specified row and column in the
    * map.
    *
    * @param {int} row The row.
    * @param {int} col The column.
    * @return {boolean} Whether this entity is at that row and column.
    */
   isAt(row, col) {
      return this.mapRow === row && this.mapCol === col;
   }
   
   isMoving() {
      return this.xOffs!==0 || this.yOffs!==0;
   }
   
   /**
    * If this entity is only allowed to walk around in a certain range, this
    * method returns true iff the specified location is outside of that range.
    */
   _isOutOfRange(row, col) {
      if (this.range) {
         return col<this.range[0] || col>this.range[2] ||
               row<this.range[1] || row>this.range[3];
      }
      return false;
   }
   
   setMapLocation(row, col) {
      if (this.mapRow!=null && this.mapCol!=null) {
         var layer = this.game.getCollisionLayer();
         layer.setData(this.mapRow, this.mapCol, 0);
         if (row>-1 && col>-1) { // row===-1 && col===-1 => don't display
            layer.setData(row, col, 1);
         }
      }
      this.mapRow = row;
      this.mapCol = col;
      this.xOffs = this.yOffs = 0;
   }
   
   /**
    * Call this with care.
    */
   setMoveIncrement(moveInc) {
      moveInc = Math.max(0, moveInc);
      this._moveInc = moveInc;
   }
   
   /**
    * Tries to move the player onto the specified tile.
    *
    * @param row
    * @param col
    * @return Whether the move was successful.
    */
   _tryToMove(row, col) {

      if (this._isOutOfRange(row, col)) {
         return false;
      }
      
      var data = this.game.getCollisionLayer().getData(row, col);
      var canWalk = data===0;//-1;
      if (canWalk) {
         this.setMapLocation(row, col);
      }
      
      // TODO: Is there a better way to determine that I'm the hero?
      else if (data===361 && this.constructor === dw.Hero) { // i.e., not an NPC
         this.game.bump();
      }
      /*
      else {
         console.log("Can't walk (" + row + ", " + col + "): " + data);
      }
      */
      return canWalk;
   }
   
   tryToMoveLeft() {
      var success = false;
      var col = this.mapCol - 1;
      if (col<0) {
         col += this.game.map.colCount;
      }
      if (this._tryToMove(this.mapRow, col)) {
         this.xOffs = this.game.getTileSize();
         success = true;
      }
      this.direction = Direction.WEST;
      return success;
   }
   
   tryToMoveRight() {
      var success = false;
      var col = Math.floor((this.mapCol+1) % this.game.map.colCount);
      if (this._tryToMove(this.mapRow, col)) {
         this.xOffs = -this.game.getTileSize();
         success = true;
      }
      this.direction = Direction.EAST;
      return success;
   }
   
   tryToMoveUp() {
      var success = false;
      var row = this.mapRow - 1;
      if (row<0) {
         row += this.game.map.rowCount;
      }
      if (this._tryToMove(row, this.mapCol)) {
         this.yOffs += this.game.getTileSize();
         success = true;
      }
      this.direction = Direction.NORTH;
      return success;
   }
   
   tryToMoveDown() {
      var success = false;
      var row = Math.floor((this.mapRow+1) % this.game.map.rowCount);
      if (this._tryToMove(row, this.mapCol)) {
         this.yOffs -= this.game.getTileSize();
         success = true;
      }
      this.direction = Direction.SOUTH;
      return success;
   }
}
