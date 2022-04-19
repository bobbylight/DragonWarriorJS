import DwGame from '../DwGame';
import AbstractMapLogic, { NpcTextGeneratorMap } from './AbstractMapLogic';
import { NpcText } from './MapLogic';

const talks: NpcTextGeneratorMap = {

   npc: (game: DwGame): NpcText => {
      return [
         'I speak with... \\ddelays...',
         'Did you notice that?'
      ];
   }

};

/**
 * Logic for the overworld.
 */
export default class Overworld extends AbstractMapLogic {

   constructor() {
      super(talks);
   }
}
