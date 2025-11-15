import { Direction } from './Direction';
import { DwGame } from './DwGame';
import { ChoiceBubble } from './ChoiceBubble';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Cheats {

    static createWarpBubble(game: DwGame): ChoiceBubble<string> {

        const tileSize: number = game.getTileSize();
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = 7 * tileSize;
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        const choices: string[] = [
            'Brecconary',
            'Tantegel (1st floor)',
            'Tantegel (throne room)',
            'Garinham',
            'Erdrick\'s Cave',
            'Far Reaches',
        ];

        return new ChoiceBubble(game, x, y, w, h, choices, undefined, true);
    }

    static warpTo(game: DwGame, mapName: string, row: number, col: number, desc: string, dir: number = Direction.SOUTH) {
        game.loadMap(mapName, row, col, dir);
        game.setStatusMessage(`Warping to ${desc}...`);
    }
}
