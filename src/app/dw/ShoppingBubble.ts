import Bubble from './Bubble';
import DwGame from './DwGame';
import { InputManager } from 'gtp';

export default class ShoppingBubble extends Bubble {

   private _choices: any[];
   private _curChoice: number;

   constructor(game: DwGame, shoppingInfo: any) {

      const tileSize: number = game.getTileSize();
      const x: number = 5 * tileSize;
      const y: number = 1 * tileSize;
      const width: number = 9 * tileSize;
      const height: number = 6 * tileSize;
      super(null, x, y, width, height);

      this._choices = shoppingInfo.choices.map((choice) => {
         return game.getWeapon(choice) || game.getArmor(choice) || game.getShield(choice);
      });

      this._curChoice = 0;
   }

   /**
    * Returns whether the user is "done" talking; that is, whether the entire
    * conversation has been rendered (including multiple pages, if necessary).
    */
   handleInput() {

      const im: InputManager = this.game.inputManager;

      if (this.game.cancelKeyPressed()) {
         this._curChoice = -1;
         return true;
      } else if (this.game.actionKeyPressed()) {
         return true;
      } else if (im.up(true)) {
         this._curChoice = Math.max(0, this._curChoice - 1);
      } else if (im.down(true)) {
         this._curChoice = Math.min(this._curChoice + 1, this._choices.length - 1);
      }

      return false;
   }

   paintContent(ctx: CanvasRenderingContext2D, y: number) {

      const x: number = this.x + Bubble.MARGIN + 10 * this.game.scale;

      ctx.fillStyle = 'rgb(255,255,255)';
      for (let i: number = 0; i < this._choices.length; i++) {
         if (this._curChoice === i) {
            this.game.drawArrow(this.x + Bubble.MARGIN, y);
         }
         this.game.drawString(this._choices[i].displayName, x, y);
         y += 10 * this.game.scale;
      }

   }

   getSelectedItem(): any {
      return this._curChoice === -1 ? null :
          this._choices[this._curChoice];
   }

   setChoices(choices: any[]) {
      this._choices = choices;
   }
}
