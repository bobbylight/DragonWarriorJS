/**
 * Logic for Erdrick's Cave, 1st floor.
 * @constructor
 */
function ErdricksCave1() {
   
}

ErdricksCave1.prototype = (function() {
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

ErdricksCave1.prototype.constructor = ErdricksCave1;
