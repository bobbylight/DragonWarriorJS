import { DwGame } from './DwGame';
import { ShoppingInfo } from './ConversationSegment';
import { Sellable } from './Sellable';
import { ChoiceBubble } from './ChoiceBubble';

export class ShoppingBubble extends ChoiceBubble<Sellable> {

    constructor(game: DwGame, shoppingInfo: ShoppingInfo) {

        const tileSize: number = game.getTileSize();
        const choices = shoppingInfo.choices.map((choice) => {
            return game.getWeapon(choice) || game.getArmor(choice) || game.getShield(choice);
        });
        super(game, 5 * tileSize, 1 * tileSize, 9 * tileSize, 6 * tileSize,
            choices, (choice) => choice.displayName, true);
        this.yInc = 10 * game.scale;
    }
}
