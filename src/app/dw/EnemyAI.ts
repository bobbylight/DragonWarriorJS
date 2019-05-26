import Hero from './Hero';
import Enemy from './Enemy';

interface AiMap {
   [ name: string ]: EnemyAiFunc;
}

const aiMap: AiMap = {};
aiMap.attackOnly = (hero: Hero, enemy: Enemy) => {
   return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};

export interface EnemyAiResult {
   type: string;
   damage: number;
}

export interface EnemyAiFunc {
   (hero: Hero, enemy: Enemy): EnemyAiResult;
}

export default class EnemyAI {

   static get(id: string): EnemyAiFunc {
      if (aiMap[id]) {
         return aiMap[id];
      }
      console.error('Unknown dw.EnemyAI: ' + id + '. Falling back on attackOnly');
      return aiMap.attackOnly;
   }
}
