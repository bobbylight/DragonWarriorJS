/**
 * Logic for the town of Brecconary.
 * @constructor
 */
function Brecconary() {
   
}

Brecconary.prototype = (function() {
   'use strict';
   
   var talks = {
      
      greeter: function(game) {
         return 'Thou art most welcome in Brecconary.';
      },
      
      oldman1: function(game) {
         return 'Watch thy Hit Points when in the Poisonous Marsh.';
      },
      
      woman_at_shop: function(game) {
         return 'Welcome!\nEnter the shop and speak to its keeper across the desk.';
      },
      
      soldier1: function(game) {
         return [ 'Many have been the warriors who have perished on this quest.',
            'But for thee I wish success, {hero.name}.' ];
      },
      
      oldman_test: function(game) {
         
         if (game.hero.strength<100) {
            return [
               'Brave traveler, you must save us from the dreaded Dragon Lord!!',
               'But you should buy some supplies before venturing out...',
               {
                  id: 'makeUserChoose',
                  clear: false,
                  text: 'Do you want my help?',
                  choices: [
                     { text: 'Yes', next: function() {
                           game.hero.addGold(10);
                           return 'iGaveYouMoney';
                        }
                     },
                     { text: 'Nope', next: 'makeUserChoose' },
                  ]
               },
               {
                  id: 'iGaveYouMoney', text: "I've given you all I have... 100 gold.  Good luck, my child."
               }
            ];
         }
         
         else {
            return 'Wow, you are strong! I cannot help you.  Go, defeat the Dragon Lord!';
         }
      },
      
      innkeeper: function(game) {
         return 'Sorry, the inn is temporarily closed while we renovate.';
      },
      
      merchant1: function(game) {
         return "I'm all sold out after the Carnival yesterday.  Boy, you missed out on some good deals!";
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
//            return initialTalks[npc.name] || 'I have nothing to say...';
var data = talks[npc.name];
return data ? data(game) : 'I have nothing to say...';
         }
      }
   
   });
   
})();

Brecconary.prototype.constructor = Brecconary;
