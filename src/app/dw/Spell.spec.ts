import { beforeEach, describe, expect, it } from 'vitest';
import { healSpell, hurtSpell } from '@/app/dw/Spell';
import { Enemy } from '@/app/dw/Enemy';
import { DwGame } from '@/app/dw/DwGame';
import { Hero } from '@/app/dw/Hero';

describe('Spell', () => {
    let game: DwGame;

    beforeEach(() => {
        game = new DwGame();
        game.assets.set('enemies', {
            slime: {
                name: 'Slime',
                image: 'Slime',
                damagedImage: 'Slime_damaged',
                str: 5,
                agility: 3,
                hp: 3,
                resist: { sleep: 0, stopSpell: 15, hurt: 0 },
                dodge: 1,
                xp: 1,
                gp: 1,
                ai: 'attackOnly',
            },
        });
    });

    describe('healSpell', () => {
        it('costs 4 mp', () => {
            expect(healSpell.cost).toEqual(4);
        });

        describe('when the caster is an Enemy', () => {
            let caster: Enemy;

            beforeEach(() => {
                caster = new Enemy(game, game.getEnemy('slime'));
            });

            it('adds to their hp', () => {
                caster.hp = 1;
                healSpell.cast(caster);
                expect(caster.hp).toBeGreaterThan(1);
            });

            it('honors their max HP', () => {
                caster.hp = caster.maxHp - 1;
                healSpell.cast(caster);
                expect(caster.hp).toEqual(caster.maxHp);
            });

            it('returns the expected response', () => {
                expect(healSpell.cast(caster)).toEqual({});
            });
        });

        describe('when the caster is a Hero', () => {
            let caster: Hero;

            beforeEach(() => {
                caster = new Hero(game, { name: 'Erdrick' });
            });

            it('adds to their hp', () => {
                caster.hp = 1;
                healSpell.cast(caster);
                expect(caster.hp).toBeGreaterThan(1);
            });

            it('honors their max HP', () => {
                caster.hp = caster.maxHp - 1;
                healSpell.cast(caster);
                expect(caster.hp).toEqual(caster.maxHp);
            });

            it('returns the expected response', () => {
                expect(healSpell.cast(caster)).toEqual({});
            });
        });
    });

    describe('hurtSpell', () => {
        let hero: Hero;
        let enemy: Enemy;

        beforeEach(() => {
            hero = new Hero(game, { name: 'Erdrick' });
            enemy = new Enemy(game, game.getEnemy('slime'));
        });

        it('costs 2 mp', () => {
            expect(hurtSpell.cost).toEqual(2);
        });

        describe('when the caster is an Enemy', () => {
            it('lowers the target\'s hp', () => {
                hero.hp = hero.maxHp;
                hurtSpell.cast(enemy, hero);
                expect(hero.hp).toBeLessThan(hero.maxHp);
            });

            it('does not take the target\'s HP below 0', () => {
                hero.hp = 1;
                hurtSpell.cast(enemy, hero);
                expect(hero.hp).toEqual(0);
            });

            it('returns the expected response', () => {
                const result = hurtSpell.cast(enemy, hero);
                expect(result.conversationSegments).toBeDefined();
                expect(result.conversationSegments?.length).toEqual(1);
                expect(result.conversationSegments?.[0].text).toMatch(/Thy Hit Points have been reduced by \d+./);
            });
        });

        describe('when the caster is a Hero', () => {
            it('lowers the target\'s hp', () => {
                enemy.hp = enemy.maxHp;
                hurtSpell.cast(hero, enemy);
                expect(enemy.hp).toBeLessThan(enemy.maxHp);
            });

            it('does not take the target\'s HP below 0', () => {
                hero.hp = 1;
                hurtSpell.cast(hero, enemy);
                expect(enemy.hp).toEqual(0);
            });

            it('returns the expected response', () => {
                const result = hurtSpell.cast(hero, enemy);
                expect(result.conversationSegments).toBeDefined();
                expect(result.conversationSegments?.length).toEqual(1);
                expect(result.conversationSegments?.[0].text).toMatch(
                    /The Slime's Hit Points have been reduced by \d+./);
            });

            it('returns the expected response when there is no target', () => {
                const result = hurtSpell.cast(hero);
                expect(result.conversationSegments).toBeDefined();
                expect(result.conversationSegments?.length).toEqual(1);
                expect(result.conversationSegments?.[0].text).toEqual('But nothing happened.');
            });
        });
    });
});
