import { Direction } from './Direction';
import { DwGame } from './DwGame';
import { ChoiceBubble } from './ChoiceBubble';
import { EnemyData } from './Enemy';
import { Armor } from './Armor';
import { Shield } from './Shield';
import { Weapon } from './Weapon';

export type CheatOption =
    'Change Gold...' |
    'Level Up' |
    'Change Weapon...' |
    'Change Armor...' |
    'Change Shield...' |
    'Max HP/MP' |
    'Min HP/MP' |
    'Battle...';

export type GoldOption = '9999 Gold' | '1000 Gold' | '1 Gold' | '0 Gold';

export type WarpLocation =
    'Brecconary' |
    'Tantegel (1st floor)' |
    'Tantegel (throne room)' |
    'Garinham' |
    'Erdrick\'s Cave' |
    'Kol';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Cheats {

    static createCheatBubble(game: DwGame): ChoiceBubble<CheatOption> {

        const tileSize: number = game.getTileSize();
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = 10 * tileSize;
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        const choices: CheatOption[] = [
            'Change Gold...',
            'Level Up',
            'Change Weapon...',
            'Change Armor...',
            'Change Shield...',
            'Max HP/MP',
            'Min HP/MP',
            'Battle...',
        ];

        return new ChoiceBubble(game, x, y, w, h, choices, undefined, true);
    }

    static createGoldSelectBubble(game: DwGame): ChoiceBubble<GoldOption> {

        const tileSize: number = game.getTileSize();
        const choices: GoldOption[] = [ '9999 Gold', '1000 Gold', '1 Gold', '0 Gold' ];
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = choices.length * 18 * game.scale + 1.5 * tileSize;
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        return new ChoiceBubble(game, x, y, w, h, choices, undefined, true, 'GOLD');
    }

    static armorStringifier(armor: Armor, contentCharWidth: number, currentDefense: number): string {
        const delta = armor.defense - currentDefense;
        if (delta === 0) return armor.displayName;
        const statStr = delta > 0 ? `+${delta}` : `${delta}`;
        const colorId = delta > 0 ? 'statIncrease' : 'statDecrease';
        return `${armor.displayName.padEnd(contentCharWidth - statStr.length)}\\c{${colorId}}${statStr}\\c`;
    }

    static createArmorSelectBubble(game: DwGame): ChoiceBubble<Armor> {

        const tileSize: number = game.getTileSize();
        const choices: Armor[] = game.assets.get('armorArray');
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = choices.length * 18 * game.scale + 1.5 * tileSize;
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        const currentDefense = game.hero.armor?.defense ?? 0;
        return new ChoiceBubble(game, x, y, w, h, choices,
            (armor, w) => Cheats.armorStringifier(armor, w, currentDefense), true, 'ARMOR');
    }

    static createBattleBubble(game: DwGame): ChoiceBubble<EnemyData> {

        const lineHeight = 10; // Lots of choices in this menu so decrease the line height
        const w: number = game.getWidth() - 2 * game.getTileSize();
        const choices: EnemyData[] = game.getEnemyDatas();
        const rowCount: number = Math.ceil(choices.length / 2);
        const h: number = rowCount * lineHeight * game.scale + 1.5 * game.getTileSize();
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        const bubble = new ChoiceBubble(game, x, y, w, h, choices,
            (data) => data.shortName ?? data.name, true, 'BATTLE', 2);
        bubble.setYInc(lineHeight);
        return bubble;
    }

    static shieldStringifier(shield: Shield, contentCharWidth: number, currentDefense: number): string {
        const delta = shield.defense - currentDefense;
        if (delta === 0) return shield.displayName;
        const statStr = delta > 0 ? `+${delta}` : `${delta}`;
        const colorId = delta > 0 ? 'statIncrease' : 'statDecrease';
        return `${shield.displayName.padEnd(contentCharWidth - statStr.length)}\\c{${colorId}}${statStr}\\c`;
    }

    static createShieldSelectBubble(game: DwGame): ChoiceBubble<Shield> {

        const lineHeight = 18;
        const tileSize: number = game.getTileSize();
        const choices: Shield[] = game.getShieldArray();
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = choices.length * lineHeight * game.scale + 1.5 * tileSize;
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        const currentDefense = game.hero.shield?.defense ?? 0;
        return new ChoiceBubble(game, x, y, w, h, choices,
            (shield, w) => Cheats.shieldStringifier(shield, w, currentDefense), true, 'SHIELD');
    }

    static weaponStringifier(weapon: Weapon, contentCharWidth: number, currentPower: number): string {
        const delta = weapon.power - currentPower;
        if (delta === 0) return weapon.displayName;
        const statStr = delta > 0 ? `+${delta}` : `${delta}`;
        const colorId = delta > 0 ? 'statIncrease' : 'statDecrease';
        return `${weapon.displayName.padEnd(contentCharWidth - statStr.length)}\\c{${colorId}}${statStr}\\c`;
    }

    static createWeaponSelectBubble(game: DwGame): ChoiceBubble<Weapon> {

        const tileSize: number = game.getTileSize();
        const weaponsArray: Weapon[] = game.assets.get('weaponsArray');
        const weapons: Weapon[] = [ ...weaponsArray ].sort((a, b) => a.power - b.power);
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = weapons.length * 18 * game.scale + 1.5 * tileSize;
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        const currentPower = game.hero.weapon?.power ?? 0;
        return new ChoiceBubble(game, x, y, w, h, weapons,
            (weapon, w) => Cheats.weaponStringifier(weapon, w, currentPower), true, 'WEAPON');
    }

    static createWarpBubble(game: DwGame): ChoiceBubble<WarpLocation> {

        const tileSize: number = game.getTileSize();
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = 7 * tileSize;
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        const choices: WarpLocation[] = [
            'Brecconary',
            'Tantegel (1st floor)',
            'Tantegel (throne room)',
            'Garinham',
            'Erdrick\'s Cave',
            'Kol',
        ];

        return new ChoiceBubble(game, x, y, w, h, choices, undefined, true);
    }

    static warp(game: DwGame, location: WarpLocation) {
        switch (location) {
            case 'Brecconary':
                Cheats.warpTo(game, 'brecconary', 15, 2, 'Brecconary', Direction.EAST);
                break;
            case 'Tantegel (1st floor)':
                Cheats.warpTo(game, 'tantegelCastle', 15, 7, 'Tantegel Castle', Direction.WEST);
                break;
            case 'Tantegel (throne room)':
                Cheats.warpTo(game, 'tantegelCastleUpstairs', 11, 10, 'the King at Tantegel Castle', Direction.WEST);
                break;
            case 'Garinham':
                Cheats.warpTo(game, 'garinham', 14, 1, 'Garinham');
                break;
            case 'Erdrick\'s Cave':
                Cheats.warpTo(game, 'erdricksCave1', 1, 1, 'Erdrick\'s Cave');
                break;
            case 'Kol':
                Cheats.warpTo(game, 'kol', 24, 20, 'Kol', Direction.NORTH);
                break;
        }
    }

    private static warpTo(game: DwGame, mapName: string, row: number, col: number, desc: string,
        dir: number = Direction.SOUTH) {
        game.loadMap(mapName, row, col, dir);
        game.setStatusMessage(`Warping to ${desc}...`);
    }
}
