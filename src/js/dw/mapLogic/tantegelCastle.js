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
         return 'Welcome to Tantegel Castle.';
      },
      
      south_soldier_right: function(game) {
         return 'Welcome to Tantegel Castle.';
      },
      
      bottom_left_merchant_1: function(game) {
         return "We are merchants who have traveled much in this land.\n" +
               "Many of our colleagues have been killed by servants of the Dragonlord.";
      },
      
      bottom_left_merchant_2: function(game) {
         return "Rumor has it that entire towns have been destroyed by the Dragonlord's servants.";
      },
      
      bottom_right_soldier: function(game) {
         return 'Where oh where can I find Princess Gwaelin?';
      },
      
      bottom_right_soldier_2: function(game) {
         return 'When entering the cave, take with thee a torch.';
      },
      
      bottom_right_old_man: function(game) {
         return "\\w{hero.name}'s coming was foretold by legend. May the light shine upon this brave warrior.";
      },
      
      stairs_soldier_north: function(game) {
         return 'King Lorik will record thy deeds in his Imperial Scroll so thou may return to thy quest later.';
      },
      
      stairs_soldier_south: function(game) {
         return 'If thou art planning to take a rest, first see King Lorik.';
      },
      
      woman_near_stairs: function(game) {
         return 'Where oh where can I find Princess Gwaelin?';
      },
      
      man_near_stairs: function(game) {
         return 'There was a time when Brecconary was a paradise.\n' +
               "Then the Dragonlord's minions came.";
      },
      
      treasure_room_soldier: function(game) {
         return 'How did you get in here???'; // TODO
      },
      
      man_in_west_room: function(game) {
         return 'To become strong enough to face future trials thou must first battle many foes.';
      },
      
      top_right_soldier: function(game) {
         return 'Thou must have a key to open a door.';
      },
      
      outside_merchant: function(game) {
         return 'I have nothing to sell right now!'; // TODO
      },
      
      outside_woman: function(game) {
         return 'What are you doing out here?'; // TODO
      },
      
      prison_guard_soldier: function(game) {
         return 'This is the prison.'; // TODO
      },
      
      old_man_east: function(game) {
         return "Leave me alone, I'm old!"; // TODO
      },
      
      prisoner_red_soldier: function(game) {
         return 'I was arrested for being a peeping tom.'; // TODO
      },
      
      // King's court NPCs
      
      king_soldier_right: function(game) {
         return 'Listen to what people say.\nIt can be of great help.';
      },
      
      king_soldier_left: function(game) {
         return [ 'A word of advice.',
               'Save thy money for more expensive armor.' ];
      },
      
      king_soldier_wandering: function(game) {
         return [
            {
               text: 'Dost thou know about Princess Gwaelin?',
               afterSound: 'confirmation',
               choices: [
                  { text: 'Yes', next: 'knows' },
                  { text: 'No', next: 'doesntKnow' }
               ]
            },
            {
               id: 'doesntKnow',
               text: 'Half a year hath passed since the Princess was kidnapped by the enemy.'
            },
            'Never does the King speak of it, but he must be suffering much.',
            {
               id: 'knows',
               text: '\\w{hero.name}, please save the Princess.',
               next: '_done'
            },
         ];
      },
      
      king: function(game) {
         return 'You cannot save yet.  Sorry!';
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
