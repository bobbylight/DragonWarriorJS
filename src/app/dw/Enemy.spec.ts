import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Utils } from 'gtp';
import { DwGame } from '@/app/dw/DwGame';
import { Enemy, EnemyData } from '@/app/dw/Enemy';
import { Hero } from '@/app/dw/Hero';

const mockFont = { cellW: 8, cellH: 9 };

const slimeData: EnemyData = {
    name: 'Slime',
    image: 'slime',
    damagedImage: 'slimedamaged',
    str: 5,
    agility: 3,
    hp: 3,
    resist: {},
    dodge: 0,
    xp: 1,
    gp: 2,
    ai: 'attackOnly',
};

describe('Enemy', () => {
    let game: DwGame;

    beforeEach(() => {
        game = new DwGame();
        game.assets.set('font', mockFont);
        game.assets.set('enemies', { slime: slimeData });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('populates fields from EnemyData', () => {
            const enemy = new Enemy(game, slimeData);
            expect(enemy.name).toEqual('Slime');
            expect(enemy.image).toEqual('slime');
            expect(enemy.damagedImage).toEqual('slimedamaged');
            expect(enemy.str).toEqual(5);
            expect(enemy.agility).toEqual(3);
            expect(enemy.hp).toEqual(3);
            expect(enemy.maxHp).toEqual(3);
            expect(enemy.dodge).toEqual(0);
            expect(enemy.xp).toEqual(1);
        });

        it('uses name as shortName when shortName is not provided', () => {
            const enemy = new Enemy(game, slimeData);
            expect(enemy.shortName).toEqual('Slime');
        });

        it('uses shortName when provided', () => {
            const enemy = new Enemy(game, { ...slimeData, shortName: 'Slm' });
            expect(enemy.shortName).toEqual('Slm');
        });

        it('uses gp directly when gp is a number', () => {
            const enemy = new Enemy(game, { ...slimeData, gp: 10 });
            expect(enemy.gp).toEqual(10);
        });

        it('randomizes gp within range when gp is an array', () => {
            const randomIntSpy = vi.spyOn(Utils, 'randomInt').mockReturnValue(4);
            const enemy = new Enemy(game, { ...slimeData, gp: [ 3, 6 ] });
            expect(randomIntSpy).toHaveBeenCalledWith(3, 7);
            expect(enemy.gp).toEqual(4);
        });

        it('randomizes hp within range when hp is an array', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(7);
            const enemy = new Enemy(game, { ...slimeData, hp: [ 5, 10 ] });
            expect(enemy.hp).toEqual(7);
            expect(enemy.maxHp).toEqual(7);
        });

        it('falls back to attackOnly ai for unknown ai id', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const enemy = new Enemy(game, { ...slimeData, ai: 'unknownAi' });
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('unknownAi'));
            expect(enemy.ai).toBeTypeOf('function');
        });
    });

    describe('computePhysicalAttackDamage()', () => {
        let enemy: Enemy;
        let hero: { getDefense: () => number; armor: undefined };

        beforeEach(() => {
            enemy = new Enemy(game, slimeData);
            hero = { getDefense: () => 2, armor: undefined };
        });

        it('uses reduced damage formula when hero defense >= enemy str', () => {
            const randomIntSpy = vi.spyOn(Utils, 'randomInt').mockReturnValue(1);
            const weakHero = { getDefense: () => 10, armor: undefined } as unknown as Hero;
            const damage = enemy.computePhysicalAttackDamage(weakHero);
            // str=5, so max = floor((5+4)/6) = 1; randomInt(0, 2) => 1
            expect(randomIntSpy).toHaveBeenCalledWith(0, expect.any(Number));
            expect(damage).toEqual(1);
        });

        it('uses standard damage formula when hero defense < enemy str', () => {
            vi.spyOn(Utils, 'randomInt').mockReturnValue(2);
            // getDefense()=2, str=5; temp=5-1=4, min=1, max=2; randomInt(1, 3)
            const damage = enemy.computePhysicalAttackDamage(hero as unknown as Hero);
            expect(damage).toEqual(2);
        });
    });

    describe('computeHurtSpellDamage()', () => {
        let enemy: Enemy;

        beforeEach(() => {
            enemy = new Enemy(game, slimeData);
        });

        it('uses reduced range against magic armor', () => {
            const randomIntSpy = vi.spyOn(Utils, 'randomInt').mockReturnValue(4);
            const hero = { armor: { name: 'magicArmor' } } as unknown as Hero;
            const damage = enemy.computeHurtSpellDamage(hero);
            expect(randomIntSpy).toHaveBeenCalledWith(2, 7);
            expect(damage).toEqual(4);
        });

        it('uses reduced range against erdricks armor', () => {
            const randomIntSpy = vi.spyOn(Utils, 'randomInt').mockReturnValue(5);
            const hero = { armor: { name: 'erdricksArmor' } } as unknown as Hero;
            const damage = enemy.computeHurtSpellDamage(hero);
            expect(randomIntSpy).toHaveBeenCalledWith(2, 7);
            expect(damage).toEqual(5);
        });

        it('uses standard range against other armor', () => {
            const randomIntSpy = vi.spyOn(Utils, 'randomInt').mockReturnValue(7);
            const hero = { armor: { name: 'leatherArmor' } } as unknown as Hero;
            const damage = enemy.computeHurtSpellDamage(hero);
            expect(randomIntSpy).toHaveBeenCalledWith(3, 11);
            expect(damage).toEqual(7);
        });

        it('uses standard range when hero has no armor', () => {
            const randomIntSpy = vi.spyOn(Utils, 'randomInt').mockReturnValue(6);
            const hero = { armor: undefined } as unknown as Hero;
            const damage = enemy.computeHurtSpellDamage(hero);
            expect(randomIntSpy).toHaveBeenCalledWith(3, 11);
            expect(damage).toEqual(6);
        });
    });

    describe('getImage()', () => {
        it('returns the normal image when not hit', () => {
            const mockImage = { id: 'slime' };
            const mockDamagedImage = { id: 'slimedamaged' };
            game.assets.set('slime', mockImage);
            game.assets.set('slimedamaged', mockDamagedImage);
            const enemy = new Enemy(game, slimeData);
            expect(enemy.getImage(false)).toBe(mockImage);
        });

        it('returns the damaged image when hit', () => {
            const mockImage = { id: 'slime' };
            const mockDamagedImage = { id: 'slimedamaged' };
            game.assets.set('slime', mockImage);
            game.assets.set('slimedamaged', mockDamagedImage);
            const enemy = new Enemy(game, slimeData);
            expect(enemy.getImage(true)).toBe(mockDamagedImage);
        });
    });

    describe('prepare()', () => {
        it('returns itself', () => {
            const enemy = new Enemy(game, slimeData);
            expect(enemy.prepare()).toBe(enemy);
        });
    });
});
