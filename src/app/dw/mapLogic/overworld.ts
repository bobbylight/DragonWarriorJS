/**
 * Logic for the overworld.
 */
import DwGame from '../DwGame';

const talks: any = {

   npc: (game: DwGame) => {
      return [
         'I speak with... \\ddelays...',
         'Did you notice that?'
      ];
   }

};

import AbstractMapLogic from '../AbstractMapLogic';

export default class Overworld extends AbstractMapLogic {

   constructor() {
      super(talks);
   }
}
