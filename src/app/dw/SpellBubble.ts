import { DwGame } from './DwGame';
import { ChoiceBubble } from '@/app/dw/ChoiceBubble';
import { Spell } from '@/app/dw/Spell';

export class SpellBubble extends ChoiceBubble<Spell> {

    constructor(game: DwGame) {

        const tileSize: number = game.getTileSize();
        const x: number = 9 * tileSize;
        const y: number = 2 * tileSize;

        const inventorySize = game.hero.spells.length;
        const w: number = 7 * tileSize;
        const h: number = (inventorySize + 2) * tileSize;

        const spells = game.hero.spells;
        super(game, x, y, w, h, spells, (choice) => choice.name, true, 'SPELL');
    }
}
