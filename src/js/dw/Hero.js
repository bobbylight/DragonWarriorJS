/**
 * The hero is the main party member.
 * @constructor
 */
dw.Hero = function(args) {
   'use strict';
   dw.PartyMember.call(this, args);
};

dw.Hero.STEP_INC = 0;

dw.Hero.prototype = Object.create(dw.PartyMember.prototype, {
   
   /**
    * Overridden to check for warps and other interesting things we can
    * intersect on the map.
    */
   handleIntersectedObject: {
      value: function(/*TiledObject*/ obj) {
         'use strict';
         if ('warp' === obj.type) {
            var newRow = parseInt(obj.properties.row, 10);
            var newCol = parseInt(obj.properties.col, 10);
            var newDir = dw.Direction.fromString(obj.properties.dir);
            game.loadMap(obj.properties.map, newRow, newCol, newDir);
         }
      }   
   }
   
});

dw.Hero.prototype.constructor = dw.Hero;
