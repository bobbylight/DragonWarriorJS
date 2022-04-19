import DwGame from '../DwGame';
import AbstractMapLogic, { NpcTextGeneratorMap } from './AbstractMapLogic';
import { NpcText } from './MapLogic';

const talks: NpcTextGeneratorMap = {

   greeter: (game: DwGame): NpcText => {
      return 'Thou art most welcome in Brecconary.';
   },

   oldman1: (game: DwGame): NpcText => {
      return 'Watch thy Hit Points when in the Poisonous Marsh.';
   },

   woman_at_shop: (game: DwGame): NpcText => {
      return 'Welcome!\nEnter the shop and speak to its keeper across the desk.';
   },

   soldier1: (game: DwGame): NpcText => {
      return [ 'Many have been the warriors who have perished on this quest.',
         'But for thee I wish success, \\w{hero.name}.' ];
   },

   oldman_test: (game: DwGame): NpcText => {

      if (game.hero.getStrength() < 100) {
         return [
            'Brave traveler, you must save us from the dreaded Dragon Lord!!',
            'But you should buy some supplies before venturing out...',
            {
               id: 'makeUserChoose',
               clear: false,
               text: 'Do you want my help?',
               afterSound: 'confirmation',
               choices: [
                  { text: 'Yes', next: () => {
                        game.party.addGold(10);
                        return 'iGaveYouMoney';
                     }
                  },
                  { text: 'Nope', next: 'makeUserChoose' }
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

   innkeeper: (game: DwGame): NpcText => {
      return {
         conversationType: 'innkeeper',
         cost: 6
      };
   },

   merchant1: (game: DwGame): NpcText => {
      return {
         conversationType: 'merchant',
         choices: [ 'bambooPole', 'club', 'copperSword' ],
         introText: 'We deal in weapons and armor.\nDost thou wish to buy anything today?'
      };
   },

   itemMerchant: (game: DwGame): NpcText => {
      return {
         conversationType: 'merchant',
         choices: [ 'bambooPole', 'club', 'copperSword' ],
         introText: 'We deal in weapons and armor.\nDost thou wish to buy anything today?'
      };
   }
};

/**
 * Logic for the town of Brecconary.
 */
export default class Brecconary extends AbstractMapLogic {

   constructor() {
      super(talks);
   }
}
