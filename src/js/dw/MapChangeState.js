/**
 * Transitions from one map to another, lazily loading map-specific resources
 * if necessary.
 */
var MapChangeState = function() {
   'use strict';
   gtp.FadeOutInState.apply(this, arguments);
};

MapChangeState.prototype = Object.create(gtp.FadeOutInState.prototype, {
   
   init: {
      value: function() {
         'use strict';
         gtp.State.prototype.init.apply(this, arguments); // Not defined in super, but in parent of super (?)
         
// TODO: Dynamically load scripts?
//         var mapLogic = game.map.properties.logicFile;
//         if (!game.hasLogic(mapLogic)) {
//            game.assets
//         }
         
      }
   },
   
   _setState: {
      value: function(state) {
         'use strict';
         game.getMapLogic().init();
         gtp.FadeOutInState.prototype._setState.apply(this, arguments);
      }
   }
   
});
