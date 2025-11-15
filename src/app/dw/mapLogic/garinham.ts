import { DwGame } from '../DwGame';
import { AbstractMapLogic, NpcTextGeneratorMap } from './AbstractMapLogic';
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
export class Garinham extends AbstractMapLogic {

   constructor() {
      super(talks);
   }
}
