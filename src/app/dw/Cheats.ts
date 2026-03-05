import { Direction } from './Direction';
import { DwGame } from './DwGame';
import { ChoiceBubble } from './ChoiceBubble';
import { EnemyData } from './Enemy';

export type CheatOption =
    '9999 Gold' |
    'Level Up' |
    'Weapon Change' |
    'Armor Change' |
    'Shield Change' |
    'Max HP/MP' |
    'Min HP/MP' |
    'Battle...';

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
            '9999 Gold',
            'Level Up',
            'Weapon Change',
            'Armor Change',
            'Shield Change',
            'Max HP/MP',
            'Min HP/MP',
            'Battle...',
        ];

        return new ChoiceBubble(game, x, y, w, h, choices, undefined, true);
    }

    static createBattleBubble(game: DwGame): ChoiceBubble<EnemyData> {

        const tileSize: number = game.getTileSize();
        const w: number = game.getWidth() - 2 * tileSize;
        const choices: EnemyData[] = game.getEnemyDatas();
        const rowCount: number = Math.ceil(choices.length / 2);
        const h: number = (rowCount + 3) * tileSize; // +2 for padding, +1 for title
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        return new ChoiceBubble(game, x, y, w, h, choices,
            (data) => data.shortName ?? data.name, true, 'BATTLE', 2);
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
