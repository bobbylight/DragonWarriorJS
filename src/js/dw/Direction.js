dw.Direction = Object.freeze({
   
   NORTH: 0,
   EAST: 1,
   SOUTH: 2,
   WEST: 3,
   
   fromString: function(str) {
      'use strict';
      if (!str || !str.length) {
         return dw.Direction.SOUTH;
      }
      switch (str.toUpperCase()) {
         case 'NORTH':
            return dw.Direction.NORTH;
         case 'EAST':
            return dw.Direction.EAST;
         case 'WEST':
            return dw.Direction.WEST;
         case 'SOUTH':
            return dw.Direction.SOUTH;
         default:
            return dw.Direction.SOUTH;
      }
   }
   
});
