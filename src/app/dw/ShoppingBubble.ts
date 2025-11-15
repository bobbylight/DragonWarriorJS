import Bubble from './Bubble';
import DwGame from './DwGame';
import { InputManager } from 'gtp';
import { ShoppingInfo } from './ConversationSegment';
import Sellable from './Sellable';

export default class ShoppingBubble extends Bubble {

   private choices: Sellable[];
   private curChoice: number;

   constructor(game: DwGame, shoppingInfo: ShoppingInfo) {

      const tileSize: number = game.getTileSize();
      const x: number = 5 * tileSize;
      const y: number = 1 * tileSize;
      const width: number = 9 * tileSize;
      const height: number = 6 * tileSize;
      super(game, undefined, x, y, width, height);

      this.choices = shoppingInfo.choices.map((choice) => {
         return game.getWeapon(choice) || game.getArmor(choice) || game.getShield(choice);
      });

      this.curChoice = 0;
   }

   /**
    * Returns whether the user is "done" talking; that is, whether the entire
    * conversation has been rendered (including multiple pages, if necessary).
    */
   handleInput(): boolean {

      const im: InputManager = this.game.inputManager;

      if (this.game.cancelKeyPressed()) {
         this.curChoice = -1;
         return true;
      } else if (this.game.actionKeyPressed()) {
         return true;
      } else if (im.up(true)) {
         this.curChoice = Math.max(0, this.curChoice - 1);
      } else if (im.down(true)) {
         this.curChoice = Math.min(this.curChoice + 1, this.choices.length - 1);
      }

      return false;
   }

   override paintContent(ctx: CanvasRenderingContext2D, x: number, y: number) {

      ctx.fillStyle = 'rgb(255,255,255)';
      this.choices.forEach((choice, index) => {
         if (this.curChoice === index) {
            this.drawArrow(this.x + Bubble.MARGIN, y);
         }
         this.game.drawString(choice.displayName, x, y);
         y += 10 * this.game.scale;
      });

   }

   getSelectedItem(): Sellable | undefined {
      return this.curChoice === -1 ? undefined :
          this.choices[this.curChoice];
   }

   setChoices(choices: Sellable[]) {
      this.choices = choices;
   }
}
