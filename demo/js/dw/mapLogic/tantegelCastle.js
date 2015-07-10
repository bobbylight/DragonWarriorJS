/**
 * Logic for Tantegel Castle.
 * @constructor
 */
function TantegelCastle() {
   
}

TantegelCastle.prototype = (function() {
   'use strict';
   
   var talks = {
      
      south_soldier_left: function(game) {
         return 'Welcome to Tantegel Castle!';
      },
      
      south_soldier_right: function(game) {
         return 'Zzz...';
      },
      
      bottom_left_merchant_1: function(game) {
         return "I'm merchant 1";
      },
      
      bottom_left_merchant_2: function(game) {
         return "I'm merchant 2";
      },
      
      bottom_left_merchant_3: function(game) {
         return "I'm merchant 3";
      },
      
      bottom_right_soldier: function(game) {
         return 'I am not sure what to say...';
      },
      
      bottom_right_old_man: function(game) {
         return 'I am not sure what to say either...';
      },
      
      stairs_soldier_north: function(game) {
         return 'Up these stairs resides the king.';
      },
      
      stairs_soldier_south: function(game) {
         return 'I go on break in 15 minutes.';
      },
      
      woman_near_stairs: function(game) {
         return 'I do not have my text to say yet.';
      },
      
      man_near_stairs: function(game) {
         return 'I do not have my text to say yet either.';
      },
      
      treasure_room_soldier: function(game) {
         return 'How did you get in here???';
      },
      
      man_in_west_room: function(game) {
         return 'I am not sure what to say...';
      },
      
      top_right_soldier: function(game) {
         return 'You are in Tantegel Castle.';
      },
      
      outside_merchant: function(game) {
         return 'I have nothing to sell right now!';
      },
      
      outside_woman: function(game) {
         return 'What are you doing out here?';
      },
      
      prison_guard_soldier: function(game) {
         return 'This is the prison.';
      },
      
      old_man_east: function(game) {
         return "Leave me alone, I'm old!";
      },
      
      prisoner_red_soldier: function(game) {
         return 'I was arrested for being a peeping tom.';
      },
      
      // King's court NPCs
      
      king_soldier_right: function(game) {
         return '???';
      },
      
      king_soldier_left: function(game) {
         return '???';
      },
      
      king_soldier_wandering: function(game) {
         return '???';
      }
      
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

TantegelCastle.prototype.constructor = TantegelCastle;
