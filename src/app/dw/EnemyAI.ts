import { Utils } from 'gtp';
import { Hero } from './Hero';
import { Enemy } from './Enemy';

type AiMap = Record<string, EnemyAiFunc>;

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
aiMap['75Hurt25Attack'] = (hero: Hero, enemy: Enemy) => {
    const useHurt: boolean = Utils.randomInt(0, 4) < 3;
    if (useHurt) {
        return { type: 'magic', spellName: 'HURT', damage: enemy.computeHurtSpellDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.drakeemaAi = (hero: Hero, enemy: Enemy) => {
    if (enemy.hp < enemy.maxHp) {
        return { type: 'magic', spellName: 'HEAL', damage: 0 };
    }
    const useHurt: boolean = Utils.randomInt(0, 2) === 0;
    if (useHurt) {
        return { type: 'magic', spellName: 'HURT', damage: enemy.computeHurtSpellDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.wraithAi = (hero: Hero, enemy: Enemy) => {
    if (enemy.hp < enemy.maxHp / 4 && Utils.randomInt(0, 4) === 0) {
        return { type: 'magic', spellName: 'HEAL', damage: 0 };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.specterAi = (hero: Hero, enemy: Enemy) => {
    if (!hero.isAsleep() && Utils.randomInt(0, 4) === 0) {
        return { type: 'magic', spellName: 'SLEEP', damage: 0 };
    }
    if (Utils.randomInt(0, 4) < 3) {
        return { type: 'magic', spellName: 'HURT', damage: enemy.computeHurtSpellDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.stopSpellAi = (hero: Hero, enemy: Enemy) => {
    if (!hero.isStopSpelled() && Utils.randomInt(0, 2) === 0) {
        return { type: 'magic', spellName: 'STOPSPELL', damage: 0 };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.druinlordAi = (hero: Hero, enemy: Enemy) => {
    if (enemy.hp < enemy.maxHp / 4 && Utils.randomInt(0, 4) < 3) {
        return { type: 'magic', spellName: 'HEAL', damage: 0 };
    }
    if (Utils.randomInt(0, 4) === 0) {
        return { type: 'magic', spellName: 'HURT', damage: enemy.computeHurtSpellDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.wraithKnightAi = (hero: Hero, enemy: Enemy) => {
    if (enemy.hp < enemy.maxHp / 4 && Utils.randomInt(0, 4) < 3) {
        return { type: 'magic', spellName: 'HEAL', damage: 0 };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.magiwyvernAi = (hero: Hero, enemy: Enemy) => {
    if (!hero.isAsleep() && Utils.randomInt(0, 2) === 0) {
        return { type: 'magic', spellName: 'SLEEP', damage: 0 };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.greenDragonAi = (hero: Hero, enemy: Enemy) => {
    if (Utils.randomInt(0, 4) === 0) {
        return { type: 'fire', damage: enemy.computeFireBreathDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.starwyvernAi = (hero: Hero, enemy: Enemy) => {
    if (enemy.hp < enemy.maxHp / 4 && Utils.randomInt(0, 4) < 3) {
        return { type: 'magic', spellName: 'HEALMORE', damage: 0 };
    }
    if (Utils.randomInt(0, 4) === 0) {
        return { type: 'fire', damage: enemy.computeFireBreathDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.wizardAi = (hero: Hero, enemy: Enemy) => {
    if (Utils.randomInt(0, 2) === 0) {
        return { type: 'magic', spellName: 'HURTMORE', damage: enemy.computeHurtmoreSpellDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.axeKnightAi = (hero: Hero, enemy: Enemy) => {
    if (!hero.isAsleep() && Utils.randomInt(0, 4) === 0) {
        return { type: 'magic', spellName: 'SLEEP', damage: 0 };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.armoredKnightAi = (hero: Hero, enemy: Enemy) => {
    if (enemy.hp < enemy.maxHp / 4 && Utils.randomInt(0, 4) < 3) {
        return { type: 'magic', spellName: 'HEALMORE', damage: 0 };
    }
    if (Utils.randomInt(0, 4) === 0) {
        return { type: 'magic', spellName: 'HURTMORE', damage: enemy.computeHurtmoreSpellDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.redDragonAi = (hero: Hero, enemy: Enemy) => {
    if (!hero.isAsleep() && Utils.randomInt(0, 4) === 0) {
        return { type: 'magic', spellName: 'SLEEP', damage: 0 };
    }
    if (Utils.randomInt(0, 4) === 0) {
        return { type: 'fire', damage: enemy.computeFireBreathDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.dragonlord1Ai = (hero: Hero, enemy: Enemy) => {
    if (!hero.isStopSpelled() && Utils.randomInt(0, 4) === 0) {
        return { type: 'magic', spellName: 'STOPSPELL', damage: 0 };
    }
    if (Utils.randomInt(0, 4) < 3) {
        return { type: 'magic', spellName: 'HURTMORE', damage: enemy.computeHurtmoreSpellDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};
aiMap.dragonlord2Ai = (hero: Hero, enemy: Enemy) => {
    if (Utils.randomInt(0, 2) === 0) {
        return { type: 'fire', damage: enemy.computeStrongFireBreathDamage(hero) };
    }
    return { type: 'physical', damage: enemy.computePhysicalAttackDamage(hero) };
};

export type EnemyAiResult =
    | { type: 'physical'; damage: number }
    | { type: 'magic'; spellName: string; damage: number }
    | { type: 'fire'; damage: number };

export type EnemyAiFunc = (hero: Hero, enemy: Enemy) => EnemyAiResult;

export const getEnemyAi = (id: string): EnemyAiFunc => {
    if (aiMap[id]) {
        return aiMap[id];
    }
    console.error('Unknown EnemyAI: ' + id + '. Falling back on attackOnly');
    return aiMap.attackOnly;
};
