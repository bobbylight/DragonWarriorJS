/**
 * Logic for Erdrick's Cave, 2nd floor.
 * @constructor
 */
function ErdricksCave2() {
   
}

ErdricksCave2.prototype = (function() {
   'use strict';
   
   var talks = {
      
   };
   
   return Object.create(dw.MapLogic.prototype, {
      
      init: {
         value: function() {
         }
      },
      
      npcText: {
         value: function(npc) {
            console.log('Talking to: ' + JSON.stringify(npc));
//            return initialTalks[npc.name] || 'I have nothing to say...';
var data = talks[npc.name];
return data ? data(game) : 'I have nothing to say...';
         }
      }
   
   });
   
})();

ErdricksCave2.prototype.constructor = ErdricksCave2;
