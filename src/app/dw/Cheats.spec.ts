import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DwGame } from '@/app/dw/DwGame';
import { Cheats } from '@/app/dw/Cheats';
import { EnemyData } from '@/app/dw/Enemy';
import { Armor } from '@/app/dw/Armor';
import { ChoiceBubble } from '@/app/dw/ChoiceBubble';
import { Shield } from '@/app/dw/Shield';
import { Weapon } from '@/app/dw/Weapon';

const mockFont = {
    cellW: 8,
    cellH: 9,
};

const bambooStick = new Weapon('bambooStick', { name: 'bambooStick', displayName: 'Bamboo Stick', baseCost: 10, power: 2 });
const club = new Weapon('club', { name: 'club', displayName: 'Club', baseCost: 60, power: 4 });
const copperSword = new Weapon('copperSword', { name: 'copperSword', displayName: 'Copper Sword', baseCost: 180, power: 10 });

// Intentionally out of power order to verify sorting
const mockWeaponsArray: Weapon[] = [ club, bambooStick, copperSword ];

const slimeData: EnemyData = {
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
};

const redSlimeData: EnemyData = {
    name: 'Red Slime',
    image: 'RedSlime',
    damagedImage: 'Slime_damaged',
    str: 7,
    agility: 3,
    hp: 4,
    resist: { sleep: 0, stopSpell: 15, hurt: 0 },
    dodge: 1,
    xp: 1,
    gp: 2,
    ai: 'attackOnly',
};

// Enemy with a shortName to verify the stringifier
const metalScorpionData: EnemyData = {
    name: 'Metal Scorpion',
    shortName: 'Metal Scorp',
    image: 'MetalScorpion',
    damagedImage: 'MetalScorpion_damaged',
    str: 36,
    agility: 42,
    hp: [ 17, 22 ],
    resist: { sleep: 0, stopSpell: 15, hurt: 0 },
    dodge: 2,
    xp: 14,
    gp: [ 30, 39 ],
    ai: 'attackOnly',
};

// 3 armors sorted by defense ascending (as LoadingState produces)
const clothesArmor = new Armor('clothes', { name: 'clothes', displayName: 'Clothes', baseCost: 20, defense: 2 });
const leatherArmor = new Armor('leatherArmor', { name: 'leatherArmor', displayName: 'Leather Armor', baseCost: 70, defense: 4 });
const chainMail = new Armor('chainMail', { name: 'chainMail', displayName: 'Chain Mail', baseCost: 300, defense: 10 });
const mockArmorArray: Armor[] = [ clothesArmor, leatherArmor, chainMail ];

// 3 enemies: left column gets indices 0-1, right column gets index 2
const mockEnemies: Record<string, EnemyData> = {
    Slime: slimeData,
    RedSlime: redSlimeData,
    MetalScorpion: metalScorpionData,
};

// Shields in ascending defense order (as createShieldArray would produce)
const smallShield = new Shield('smallShield', { name: 'smallShield', displayName: 'Small Shield', defense: 4 });
const largeShield = new Shield('largeShield', { name: 'largeShield', displayName: 'Large Shield', defense: 10 });
const mockShieldArray: Shield[] = [ smallShield, largeShield ];

describe('Cheats', () => {

    let game: DwGame;

    beforeEach(() => {
        game = new DwGame();
        game.assets.set('font', mockFont);
        game.assets.set('enemies', mockEnemies);
        game.assets.set('weaponsArray', mockWeaponsArray);
        game.assets.set('armorArray', mockArmorArray);
        game.assets.set('shieldArray', mockShieldArray);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('createWeaponSelectBubble()', () => {

        let bubble: ChoiceBubble<Weapon>;

        beforeEach(() => {
            bubble = Cheats.createWeaponSelectBubble(game);
        });

        it('has title "WEAPON"', () => {
            expect(bubble.title).toEqual('WEAPON');
        });

        it('lists weapons sorted by power ascending', () => {
            expect(bubble.getSelectedItem()).toEqual(bambooStick);
        });

        it('selects the first (weakest) weapon by default', () => {
            expect(bubble.getSelectedIndex()).toEqual(0);
        });

        it('has width based on game width and tile size', () => {
            expect(bubble.w).toEqual(game.getWidth() - 4 * game.getTileSize());
        });

        it('has height based on weapon count', () => {
            expect(bubble.h).toEqual(mockWeaponsArray.length * 18 * game.scale + 1.5 * game.getTileSize());
        });

        it('uses the weapon displayName as the label', () => {
            // The stringifier is tested indirectly by confirming the bubble renders the displayName.
            // We verify the selected item is a Weapon with the correct displayName.
            expect(bubble.getSelectedItem()?.displayName).toEqual('Bamboo Stick');
        });

        describe('when cancelled', () => {

            it('marks input as handled and returns no selected item', () => {
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(true);
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'down').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'right').mockReturnValue(false);

                const done = bubble.handleInput();

                expect(done).toEqual(true);
                expect(bubble.getSelectedItem()).toBeUndefined();
                expect(bubble.getSelectedIndex()).toEqual(-1);
            });
        });

        describe('when navigating down and confirming', () => {

            it('selects the next weapon in ascending power order', () => {
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(false);
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'down').mockReturnValue(true);
                vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'right').mockReturnValue(false);
                vi.spyOn(game.audio, 'playSound').mockReturnValue(0);

                bubble.handleInput(); // navigate down

                vi.spyOn(game.inputManager, 'down').mockReturnValue(false);
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(true);

                const done = bubble.handleInput(); // confirm

                expect(done).toEqual(true);
                expect(bubble.getSelectedItem()).toEqual(club);
            });
        });

    });

    describe('createArmorSelectBubble()', () => {

        let bubble: ChoiceBubble<Armor>;

        beforeEach(() => {
            bubble = Cheats.createArmorSelectBubble(game);
        });

        it('has title "ARMOR"', () => {
            expect(bubble.title).toEqual('ARMOR');
        });

        it('selects the first armor by default', () => {
            expect(bubble.getSelectedIndex()).toEqual(0);
            expect(bubble.getSelectedItem()).toEqual(clothesArmor);
        });

        it('has width based on game width and tile size', () => {
            expect(bubble.w).toEqual(game.getWidth() - 4 * game.getTileSize());
        });

        it('has height based on armor count', () => {
            expect(bubble.h).toEqual(mockArmorArray.length * 18 * game.scale + 1.5 * game.getTileSize());
        });

        it('uses displayName as the label for each armor', () => {
            // Navigate to the second item and verify it's the correct armor
            vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(false);
            vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'down').mockReturnValue(true);
            vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'right').mockReturnValue(false);

            bubble.handleInput();

            expect(bubble.getSelectedItem()).toEqual(leatherArmor);
            expect(bubble.getSelectedItem()?.displayName).toEqual('Leather Armor');
        });

        describe('when cancelled', () => {

            it('marks input as handled and returns no selected item', () => {
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(true);
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'down').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'right').mockReturnValue(false);

                const done = bubble.handleInput();

                expect(done).toEqual(true);
                expect(bubble.getSelectedItem()).toBeUndefined();
                expect(bubble.getSelectedIndex()).toEqual(-1);
            });
        });

    });

    describe('createBattleBubble()', () => {

        let bubble: ChoiceBubble<EnemyData>;

        beforeEach(() => {
            bubble = Cheats.createBattleBubble(game);
        });

        it('has title "BATTLE"', () => {
            expect(bubble.title).toEqual('BATTLE');
        });

        it('selects the first enemy by default', () => {
            expect(bubble.getSelectedIndex()).toEqual(0);
            expect(bubble.getSelectedItem()).toEqual(slimeData);
        });

        it('has width based on game width and tile size', () => {
            expect(bubble.w).toEqual(game.getWidth() - 2 * game.getTileSize());
        });

        it('has height based on enemy count', () => {
            const lineHeight = 10;
            const rowCount = Math.ceil(Object.keys(mockEnemies).length / 2);
            expect(bubble.h).toEqual(rowCount * lineHeight * game.scale + 1.5 * game.getTileSize());
        });

        describe('when cancelled', () => {

            it('marks input as handled and returns no selected item', () => {
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(true);
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'down').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'right').mockReturnValue(false);

                const done = bubble.handleInput();

                expect(done).toEqual(true);
                expect(bubble.getSelectedItem()).toBeUndefined();
                expect(bubble.getSelectedIndex()).toEqual(-1);
            });
        });

    });

    describe('createShieldSelectBubble()', () => {

        let bubble: ChoiceBubble<Shield>;

        beforeEach(() => {
            bubble = Cheats.createShieldSelectBubble(game);
        });

        it('has title "SHIELD"', () => {
            expect(bubble.title).toEqual('SHIELD');
        });

        it('selects the first shield by default', () => {
            expect(bubble.getSelectedIndex()).toEqual(0);
            expect(bubble.getSelectedItem()).toEqual(smallShield);
        });

        it('has shields in ascending defense order', () => {
            vi.spyOn(game, 'actionKeyPressed').mockReturnValue(true);
            vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'down').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'right').mockReturnValue(false);

            bubble.handleInput();

            expect(bubble.getSelectedItem()).toEqual(smallShield);
        });

        it('uses displayName as the choice label', () => {
            vi.spyOn(game.inputManager, 'down').mockReturnValueOnce(true).mockReturnValue(false);
            vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'right').mockReturnValue(false);
            vi.spyOn(game, 'actionKeyPressed').mockReturnValueOnce(false).mockReturnValue(true);
            vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(false);

            bubble.handleInput(); // navigate down to largeShield
            bubble.handleInput(); // confirm largeShield

            expect(bubble.getSelectedItem()).toEqual(largeShield);
            expect(bubble.getSelectedItem()?.displayName).toEqual('Large Shield');
        });

        it('has width based on game width and tile size', () => {
            expect(bubble.w).toEqual(game.getWidth() - 4 * game.getTileSize());
        });

        it('has height based on shield count', () => {
            const lineHeight = 18;
            expect(bubble.h).toEqual(mockShieldArray.length * lineHeight * game.scale + 1.5 * game.getTileSize());
        });

        describe('when cancelled', () => {

            it('marks input as handled and returns no selected item', () => {
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(true);
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'down').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
                vi.spyOn(game.inputManager, 'right').mockReturnValue(false);

                const done = bubble.handleInput();

                expect(done).toEqual(true);
                expect(bubble.getSelectedItem()).toBeUndefined();
                expect(bubble.getSelectedIndex()).toEqual(-1);
            });
        });
    });
});
