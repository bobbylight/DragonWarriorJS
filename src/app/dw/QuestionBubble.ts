import Bubble from './Bubble';
import DwGame from './DwGame';
import { InputManager } from 'gtp';

export default class QuestionBubble extends Bubble {

   private _choices: any[];
   private _curChoice: number;

   constructor(game: DwGame, choices: any[]) {

      const tileSize: number = game.getTileSize();
      const x: number = game.getWidth() - tileSize * 6;
      const y: number = tileSize;
      const width: number = tileSize * 5;
      const height: number = tileSize * 5;
      super(null, x, y, width, height);

      this._choices = choices;
      this._curChoice = 0;
   }

   /**
    * Returns whether the user is "done" talking; that is, whether the entire
    * conversation has been rendered (including multiple pages, if necessary).
    */
   handleInput() {

      const im: InputManager = this.game.inputManager;

      if (this.game.cancelKeyPressed()) {
         this._curChoice = 0;
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

      const x: number = this.x + Bubble.MARGIN + 10 * this.game._scale;

      ctx.fillStyle = 'rgb(255,255,255)';
      for (let i: number = 0; i < this._choices.length; i++) {
         if (this._curChoice === i) {
            this.game.drawArrow(this.x + Bubble.MARGIN, y);
         }
         this.game.drawString(this._choices[i].text, x, y);
         y += 10 * this.game._scale;
      }

   }

   getSelectedChoiceNextDialogue() {
      const choice: any = this._choices[this._curChoice];
      if (choice.next) {
         // Just a string id of the next dialogue, or a function
         return choice.next.length ? choice.next : choice.next();
      }
      return null;
   }

   setChoices(choices: any[]) {
      this._choices = choices;
   }
}
