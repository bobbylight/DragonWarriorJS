import { afterEach, describe, expect, it, vi } from 'vitest';
import { Utils } from 'gtp';
import { getEnemyAi } from '@/app/dw/EnemyAI';
import { Hero } from '@/app/dw/Hero';
import { Enemy } from '@/app/dw/Enemy';

const makeHero = (overrides: Partial<{ isAsleep: () => boolean; isStopSpelled: () => boolean }> = {}): Hero => ({
    getDefense: () => 5,
    armor: undefined,
    isAsleep: () => false,
    isStopSpelled: () => false,
    ...overrides,
} as unknown as Hero);

const makeEnemy = (hp = 10, maxHp = 10) => {
    const computePhysicalAttackDamage = vi.fn().mockReturnValue(8);
    const computeHurtSpellDamage = vi.fn().mockReturnValue(12);
    const computeHurtmoreSpellDamage = vi.fn().mockReturnValue(37);
    const computeFireBreathDamage = vi.fn().mockReturnValue(20);
    const computeStrongFireBreathDamage = vi.fn().mockReturnValue(68);
    const enemy = {
        hp, maxHp,
        computePhysicalAttackDamage,
        computeHurtSpellDamage,
        computeHurtmoreSpellDamage,
        computeFireBreathDamage,
        computeStrongFireBreathDamage,
    } as unknown as Enemy;
    return { enemy, computePhysicalAttackDamage, computeHurtSpellDamage, computeHurtmoreSpellDamage, computeFireBreathDamage, computeStrongFireBreathDamage };
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

    describe('wraithAi', () => {
        it('heals when hp is below 1/4 of max and randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy(4, 20);
            const result = getEnemyAi('wraithAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HEAL', damage: 0 });
        });

        it('uses physical attack when hp is below 1/4 of max but randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(4, 20);
            const result = getEnemyAi('wraithAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hp is at the 1/4 threshold', () => {
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(5, 20);
            const result = getEnemyAi('wraithAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hp is above 1/4 of max', () => {
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(10, 20);
            const result = getEnemyAi('wraithAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('specterAi', () => {
        it('casts SLEEP when hero is not asleep and randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy();
            const result = getEnemyAi('specterAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'SLEEP', damage: 0 });
        });

        it('does not cast SLEEP when hero is already asleep, then casts HURT', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero({ isAsleep: () => true });
            const { enemy, computeHurtSpellDamage } = makeEnemy();
            const result = getEnemyAi('specterAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURT', damage: 12 });
            expect(computeHurtSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('casts HURT when SLEEP check is skipped and roll is < 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computeHurtSpellDamage } = makeEnemy();
            const result = getEnemyAi('specterAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURT', damage: 12 });
            expect(computeHurtSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when all rolls are 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(3);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('specterAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('stopSpellAi', () => {
        it('casts STOPSPELL when hero is not stop-spelled and randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy();
            const result = getEnemyAi('stopSpellAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'STOPSPELL', damage: 0 });
        });

        it('uses physical attack when hero is not stop-spelled but randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('stopSpellAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hero is already stop-spelled', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero({ isStopSpelled: () => true });
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('stopSpellAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('druinlordAi', () => {
        it('heals when hp is below 1/4 of max and first roll is < 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy(4, 20);
            const result = getEnemyAi('druinlordAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HEAL', damage: 0 });
        });

        it('casts HURT when hp is below 1/4 but HEAL roll misses, and HURT roll hits', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValueOnce(3).mockReturnValueOnce(0);
            const hero = makeHero();
            const { enemy, computeHurtSpellDamage } = makeEnemy(4, 20);
            const result = getEnemyAi('druinlordAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURT', damage: 12 });
            expect(computeHurtSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hp is below 1/4 but both rolls miss', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(3);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(4, 20);
            const result = getEnemyAi('druinlordAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('casts HURT when hp is at 1/4 threshold and HURT roll hits', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy, computeHurtSpellDamage } = makeEnemy(5, 20);
            const result = getEnemyAi('druinlordAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURT', damage: 12 });
            expect(computeHurtSpellDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('wraithKnightAi', () => {
        it('heals when hp is below 1/4 of max and roll is < 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy(4, 20);
            const result = getEnemyAi('wraithKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HEAL', damage: 0 });
        });

        it('uses physical attack when hp is below 1/4 but roll is 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(3);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(4, 20);
            const result = getEnemyAi('wraithKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hp is at or above 1/4 of max', () => {
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(5, 20);
            const result = getEnemyAi('wraithKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('magiwyvernAi', () => {
        it('casts SLEEP when hero is not asleep and randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy();
            const result = getEnemyAi('magiwyvernAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'SLEEP', damage: 0 });
        });

        it('uses physical attack when hero is not asleep but randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('magiwyvernAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hero is already asleep', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero({ isAsleep: () => true });
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('magiwyvernAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('greenDragonAi', () => {
        it('breathes fire when randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy, computeFireBreathDamage } = makeEnemy();
            const result = getEnemyAi('greenDragonAi')(hero, enemy);
            expect(result).toEqual({ type: 'fire', damage: 20 });
            expect(computeFireBreathDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('greenDragonAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('starwyvernAi', () => {
        it('casts HEALMORE when hp is below 1/4 of max and first roll is < 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy(4, 20);
            const result = getEnemyAi('starwyvernAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HEALMORE', damage: 0 });
        });

        it('breathes fire when hp is below 1/4 but HEALMORE roll misses and fire roll hits', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValueOnce(3).mockReturnValueOnce(0);
            const hero = makeHero();
            const { enemy, computeFireBreathDamage } = makeEnemy(4, 20);
            const result = getEnemyAi('starwyvernAi')(hero, enemy);
            expect(result).toEqual({ type: 'fire', damage: 20 });
            expect(computeFireBreathDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hp is below 1/4 but both rolls miss', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(3);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(4, 20);
            const result = getEnemyAi('starwyvernAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('breathes fire when hp is at 1/4 threshold and fire roll hits', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy, computeFireBreathDamage } = makeEnemy(5, 20);
            const result = getEnemyAi('starwyvernAi')(hero, enemy);
            expect(result).toEqual({ type: 'fire', damage: 20 });
            expect(computeFireBreathDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('wizardAi', () => {
        it('casts HURTMORE when randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy, computeHurtmoreSpellDamage } = makeEnemy();
            const result = getEnemyAi('wizardAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURTMORE', damage: 37 });
            expect(computeHurtmoreSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('wizardAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('axeKnightAi', () => {
        it('casts SLEEP when hero is not asleep and randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy();
            const result = getEnemyAi('axeKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'SLEEP', damage: 0 });
        });

        it('uses physical attack when hero is not asleep but randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('axeKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hero is already asleep', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero({ isAsleep: () => true });
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('axeKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('armoredKnightAi', () => {
        it('casts HEALMORE when hp is below 1/4 of max and first roll is < 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy(4, 20);
            const result = getEnemyAi('armoredKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HEALMORE', damage: 0 });
        });

        it('casts HURTMORE when hp is below 1/4 but HEALMORE roll misses and HURTMORE roll hits', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValueOnce(3).mockReturnValueOnce(0);
            const hero = makeHero();
            const { enemy, computeHurtmoreSpellDamage } = makeEnemy(4, 20);
            const result = getEnemyAi('armoredKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURTMORE', damage: 37 });
            expect(computeHurtmoreSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when hp is below 1/4 but both rolls miss', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(3);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy(4, 20);
            const result = getEnemyAi('armoredKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('casts HURTMORE when hp is at 1/4 threshold and HURTMORE roll hits', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy, computeHurtmoreSpellDamage } = makeEnemy(5, 20);
            const result = getEnemyAi('armoredKnightAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURTMORE', damage: 37 });
            expect(computeHurtmoreSpellDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('redDragonAi', () => {
        it('casts SLEEP when hero is not asleep and first roll is 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy();
            const result = getEnemyAi('redDragonAi')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'SLEEP', damage: 0 });
        });

        it('breathes fire when SLEEP check is skipped and fire roll hits', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValueOnce(1).mockReturnValueOnce(0);
            const hero = makeHero();
            const { enemy, computeFireBreathDamage } = makeEnemy();
            const result = getEnemyAi('redDragonAi')(hero, enemy);
            expect(result).toEqual({ type: 'fire', damage: 20 });
            expect(computeFireBreathDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when both rolls miss', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('redDragonAi')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('breathes fire when hero is asleep and fire roll hits', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero({ isAsleep: () => true });
            const { enemy, computeFireBreathDamage } = makeEnemy();
            const result = getEnemyAi('redDragonAi')(hero, enemy);
            expect(result).toEqual({ type: 'fire', damage: 20 });
            expect(computeFireBreathDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('dragonlord1Ai', () => {
        it('casts STOPSPELL when hero is not stop-spelled and first roll is 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy } = makeEnemy();
            const result = getEnemyAi('dragonlord1Ai')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'STOPSPELL', damage: 0 });
        });

        it('casts HURTMORE when STOPSPELL check is skipped and HURTMORE roll is < 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValueOnce(1).mockReturnValueOnce(0);
            const hero = makeHero();
            const { enemy, computeHurtmoreSpellDamage } = makeEnemy();
            const result = getEnemyAi('dragonlord1Ai')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURTMORE', damage: 37 });
            expect(computeHurtmoreSpellDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when both rolls miss', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(3);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('dragonlord1Ai')(hero, enemy);
            expect(result).toEqual({ type: 'physical', damage: 8 });
            expect(computePhysicalAttackDamage).toHaveBeenCalledWith(hero);
        });

        it('casts HURTMORE when hero is already stop-spelled and HURTMORE roll is < 3', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero({ isStopSpelled: () => true });
            const { enemy, computeHurtmoreSpellDamage } = makeEnemy();
            const result = getEnemyAi('dragonlord1Ai')(hero, enemy);
            expect(result).toEqual({ type: 'magic', spellName: 'HURTMORE', damage: 37 });
            expect(computeHurtmoreSpellDamage).toHaveBeenCalledWith(hero);
        });
    });

    describe('dragonlord2Ai', () => {
        it('breathes strong fire when randomInt returns 0', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(0);
            const hero = makeHero();
            const { enemy, computeStrongFireBreathDamage } = makeEnemy();
            const result = getEnemyAi('dragonlord2Ai')(hero, enemy);
            expect(result).toEqual({ type: 'fire', damage: 68 });
            expect(computeStrongFireBreathDamage).toHaveBeenCalledWith(hero);
        });

        it('uses physical attack when randomInt returns non-zero', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const hero = makeHero();
            const { enemy, computePhysicalAttackDamage } = makeEnemy();
            const result = getEnemyAi('dragonlord2Ai')(hero, enemy);
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
