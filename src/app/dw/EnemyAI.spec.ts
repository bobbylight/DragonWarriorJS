import { afterEach, describe, expect, it, vi } from 'vitest';
import { Utils } from 'gtp';
import { getEnemyAi } from '@/app/dw/EnemyAI';
import { Hero } from '@/app/dw/Hero';
import { Enemy } from '@/app/dw/Enemy';

const makeHero = (): Hero => ({ getDefense: () => 5, armor: undefined } as unknown as Hero);

const makeEnemy = (hp = 10, maxHp = 10) => {
    const computePhysicalAttackDamage = vi.fn().mockReturnValue(8);
    const computeHurtSpellDamage = vi.fn().mockReturnValue(12);
    const enemy = { hp, maxHp, computePhysicalAttackDamage, computeHurtSpellDamage } as unknown as Enemy;
    return { enemy, computePhysicalAttackDamage, computeHurtSpellDamage };
};

describe('getEnemyAi()', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('attackOnly', () => {
        it('always returns a physical attack', () => {
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('attackOnly')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('halfHurtHalfAttack', () => {
        it('uses HURT spell when randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy, computeHurtSpellDamage } = makeEnemy();
            const result = getEnemyAi('halfHurtHalfAttack')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURT', damage: 12 });
            expect(computeHurtSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('halfHurtHalfAttack')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('75Hurt25Attack', () => {
        it.each([ 0, 1, 2 ])('uses HURT spell when randomInt returns %i (< 3)', (roll) => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(roll);
            const hero = makeHero();
            const { enemy, computeHurtSpellDamage } = makeEnemy();
            const result = getEnemyAi('75Hurt25Attack')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURT', damage: 12 });
            expect(computeHurtSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when randomInt returns 3 (>= 3)', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(3);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('75Hurt25Attack')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('drakeemaAi', () => {
        it('heals itself when hp is below max', () => {
            const hero = makeHero();
            const { enemy } = makeEnemy(5, 10);
            const result = getEnemyAi('drakeemaAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HEAL', damage: 0 });
        });

        it('uses HURT spell at full hp when randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy, computeHurtSpellDamage } = makeEnemy(10, 10);
            const result = getEnemyAi('drakeemaAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURT', damage: 12 });
            expect(computeHurtSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack at full hp when randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(10, 10);
            const result = getEnemyAi('drakeemaAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('unknown ID fallback', () => {
        it('logs an error containing the unknown ID', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            getEnemyAi('bogusAi');
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('bogusAi'));
        });

        it('returns a function that behaves like attackOnly', () => {
            vi.spyOn(console, 'error').mockImplementation(() => {});
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('bogusAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });
});
