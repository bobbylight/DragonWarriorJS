import DwGame from './DwGame';
import RoamingState from './RoamingState';
import Bubble from './Bubble';
import { InputManager } from 'gtp';

export default class CommandBubble extends Bubble {

   selection: number;

   constructor() {

      const game: DwGame = (window as any).game;

      const scale: number = game._scale;
      const tileSize: number = game.getTileSize();
      const w: number = 140 * scale;
      const h: number = 90 * scale;
      const x: number = game.getWidth() - tileSize - w;
      const y: number = tileSize;
      super('COMMAND', x, y, w, h);
      this.selection = 0;
   }

   handleCommandChosen(screen: RoamingState) {

      switch (this.selection) {

         case -1: // Canceled
            screen.startRoaming();
            break;

         case 0: // TALK
            screen.talkToNpc();
            break;

         case 1: // STATUS
            screen.showStatus();
            break;

         case 2: // STAIRS
            break;

         case 3: // SEARCH
            break;

         case 4: // SPELL
            break;

         case 5: // ITEM
            screen.showInventory();
            break;

         case 6: // DOOR
            screen.openDoor();
            break;

         case 7: // TAKE
            break;

      }

   }

   handleInput() {

      const im: InputManager = this.game.inputManager;

      if (im.up(true)) {
         this.selection = this.selection - 1;
         if (this.selection < 0) {
            this.selection = 7;
         }
      } else if (im.down(true)) {
         this.selection = Math.floor((this.selection + 1) % 8);
      } else if (this.selection > 3 && im.left(true)) {
         this.selection -= 4;
      } else if (this.selection < 4 && im.right(true)) {
         this.selection += 4;
      } else if (this.game.cancelKeyPressed()) {
         this.selection = -1;
         return true;
      } else if (this.game.actionKeyPressed()) {
         this.game.audio.playSound('menu');
         return true;
      }

      return false;

   }

   paintContent(ctx: CanvasRenderingContext2D, y: number) {

      const SCALE: number = this.game._scale;
      let x: number = this.x + 20 * SCALE;
      let y0: number = y;
      const Y_INC: number = this.game.stringHeight() + 7 * SCALE;

      this.game.drawString('TALK', x, y0);
      y0 += Y_INC;
      this.game.drawString('STATUS', x, y0);
      y0 += Y_INC;
      this.game.drawString('STAIRS', x, y0);
      y0 += Y_INC;
      this.game.drawString('SEARCH', x, y0);
      y0 += Y_INC;

      x += 70 * SCALE;
      y0 -= 4 * Y_INC;
      this.game.drawString('SPELL', x, y0);
      y0 += Y_INC;
      this.game.drawString('ITEM', x, y0);
      y0 += Y_INC;
      this.game.drawString('DOOR', x, y0);
      y0 += Y_INC;
      this.game.drawString('TAKE', x, y0);
      y0 += Y_INC;

      if (this.selection < 4) {
         x -= 70 * SCALE;
      }
      x -= this.game.stringWidth('>') + 2 * SCALE;
      y0 = y + Y_INC * (this.selection % 4);

      this.game.drawArrow(x, y0); // DEL, but we use for our arrow

   }

   reset() {
      this.selection = 0;
   }
}
