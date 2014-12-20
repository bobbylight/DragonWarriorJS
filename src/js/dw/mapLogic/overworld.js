/**
 * Logic for the overworld.
 * @constructor
 */
function Overworld() {
   
}

Overworld.prototype = (function() {
   'use strict';
   
   var initialTalks = {
      
      npc: function(game) {
         return [
            'I speak with... \\ddelays...',
            'Did you notice that?'
         ];
      }
      
   };
   
   return Object.create(MapLogic.prototype, {
      
      init: {
         value: function() {
         }
      },
      
      npcText: {
         value: function(npc) {
            console.log('Talking to: ' + JSON.stringify(npc));
            var func = initialTalks[npc.name];
            return func ? func(game) : 'I have nothing to say...';
         }
      }
   
   });
   
})();

Overworld.prototype.constructor = Overworld;
