/**
 * Logic for Garinham.
 */
import AbstractMapLogic from './AbstractMapLogic';
import DwGame from '../DwGame';

const talks: any = {

    merchant1: (game: DwGame) => {
        return {
            conversationType: 'merchant',
            choices: [ 'bambooPole', 'club', 'copperSword' ],
            introText: 'We deal in weapons and armor.\nDost thou wish to buy anything today?'
        };
    },
};

export default class Garinham extends AbstractMapLogic {

   constructor() {
      super(talks);
   }
}
