import Hero from './Hero';
import Enemy from './Enemy';
import { Utils } from 'gtp';

interface AiMap {
   [ name: string ]: EnemyAiFunc;
}

const aiMap: AiMap = {};
aiMap.attackOnly = (hero: Hero, enemy: Enemy) => {
   return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.halfHurtHalfAttack = (hero: Hero, enemy: Enemy) => {
    const useHurt: boolean = Utils.randomInt(0, 2) === 0;
    if (useHurt) {
        return { type: 'magic', spellName: 'HURT', damage: enemy.computeHurtSpellDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};

export interface EnemyAiResult {
   type: string;
   damage: number;
   spellName?: string;
}

export interface EnemyAiFunc {
   (hero: Hero, enemy: Enemy): EnemyAiResult;
}

export default class EnemyAI {

   static get(id: string): EnemyAiFunc {
      if (aiMap[id]) {
         return aiMap[id];
      }
      console.error('Unknown EnemyAI: ' + id + '. Falling back on attackOnly');
      return aiMap.attackOnly;
   }
}
