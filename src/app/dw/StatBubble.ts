import Bubble from './Bubble';
import DwGame from './DwGame';
import Party from './Party';
import Hero from './Hero';

export default class StatBubble extends Bubble {

   selection: number;

   constructor(game: DwGame) {
      const scale: number = game._scale;
      const tileSize: number = game.getTileSize();
      const w: number = 60 * scale;
      const h: number = 100 * scale;
      const x: number = tileSize;
      const y: number = tileSize;
      let title: string = game.hero.name;
      if (title.length > 4) {
         title = title.substring(0, 4);
      }
      super(title, x, y, w, h);
      this.selection = 0;
   }

   _calculateX2Offs(val: any) {
      return this.game.stringWidth('' + val);
//         var digits = 1;
//         while (val > 10) {
//            digits++;
//            val /= 10;
//         }
//         return digits * 10 * this.game._scale;
   }

   handleInput() {
   }

   paintContent(ctx: CanvasRenderingContext2D, y: number) {

      const SCALE: number = this.game._scale;
      const x: number = this.x + Bubble.MARGIN;
      const x2: number = this.x + this.w - Bubble.MARGIN;
      let y0: number = y;
      const Y_INC: number = this.game.stringHeight() + 7 * SCALE;
      const party: Party = this.game.party;
      const hero: Hero = this.game.hero;

      this.game.drawString('LV', x, y0);
      let xOffs: number = this._calculateX2Offs(hero.level);
      this.game.drawString('' + hero.level, x2 - xOffs, y0);
      y0 += Y_INC;

      this.game.drawString('HP', x, y0);
      xOffs = this._calculateX2Offs(hero.hp);
      this.game.drawString('' + hero.hp, x2 - xOffs, y0);
      y0 += Y_INC;

      this.game.drawString('MP', x, y0);
      xOffs = this._calculateX2Offs(hero.mp);
      this.game.drawString('' + hero.mp, x2 - xOffs, y0);
      y0 += Y_INC;

      this.game.drawString('G', x, y0);
      xOffs = this._calculateX2Offs(party.gold);
      this.game.drawString('' + party.gold, x2 - xOffs, y0);
      y0 += Y_INC;

      this.game.drawString('E', x, y0);
      xOffs = this._calculateX2Offs(hero.exp);
      this.game.drawString('' + hero.exp, x2 - xOffs, y0);
      y0 += Y_INC;

   }
}
