import { DwGame } from './DwGame';
import { ChoiceBubble } from "@/app/dw/ChoiceBubble";
import { Item } from '@/app/dw/Item';

export class ItemBubble extends ChoiceBubble<Item> {

    constructor(game: DwGame) {

        const tileSize: number = game.getTileSize();
        const x: number = 9 * tileSize;
        const y: number = 3 * tileSize;

        const inventorySize = game.getParty().getInventory().getSize();
        const w: number = 7 * tileSize;
        const h: number = (inventorySize + 2) * tileSize;

        const choices = game.party.getInventory().getItems();
        super(game, x, y, w, h, choices, (choice) => choice.name, true);
    }
}
