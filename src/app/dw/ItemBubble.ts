import { DwGame } from './DwGame';
import { ItemCountPair } from './Inventory';
import { ChoiceBubble } from "@/app/dw/ChoiceBubble";

export class ItemBubble extends ChoiceBubble<ItemCountPair> {

    constructor(game: DwGame) {

        const scale: number = game.scale;
        const tileSize: number = game.getTileSize();
        const w: number = 7 * tileSize;
        const h: number = 100 * scale;
        const x: number = 9 * tileSize;
        const y: number = 3 * tileSize;

        const choices = game.party.getInventory().getItems();
        super(game, x, y, w, h, choices, (choice) => choice.item.name);
    }
}
