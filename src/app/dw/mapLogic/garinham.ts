import AbstractMapLogic, { NpcTextGeneratorMap } from './AbstractMapLogic';
import DwGame from '../DwGame';
import { NpcText } from './MapLogic';

const talks: NpcTextGeneratorMap = {

    merchant1: (game: DwGame): NpcText => {
        return {
            conversationType: 'merchant',
            choices: [ 'bambooPole', 'club', 'copperSword' ],
            introText: 'We deal in weapons and armor.\nDost thou wish to buy anything today?',
        };
    },
};

/**
 * Logic for Garinham.
 */
export default class Garinham extends AbstractMapLogic {

   constructor() {
      super(talks);
   }
}
