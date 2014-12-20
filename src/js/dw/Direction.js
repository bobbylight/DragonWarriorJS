Direction = Object.freeze({
   
   NORTH: 0,
   EAST: 1,
   SOUTH: 2,
   WEST: 3,
   
   fromString: function(str) {
      'use strict';
      if (!str || !str.length) {
         return Direction.SOUTH;
      }
      switch (str.toUpperCase()) {
         case 'NORTH':
            return Direction.NORTH;
         case 'EAST':
            return Direction.EAST;
         case 'WEST':
            return Direction.WEST;
         case 'SOUTH':
            return Direction.SOUTH;
         default:
            return Direction.SOUTH;
      }
   }
   
});
