import { FadeOutInState } from 'gtp';
import { BaseState } from './BaseState';
import { DwGame } from './DwGame';
import { TitleScreenState } from './TitleScreenState';
import { BattleState } from './BattleState';

export class DeadState extends BaseState {

   private readonly battleState: BattleState;
   private allowUserInput?: boolean;

   constructor(game: DwGame, battleState: BattleState) {
      super(game);
      this.battleState = battleState;
       this.game.audio.playMusic(null);
       this.game.audio.playSound('dead', false, () => {
           this.allowUserInput = true;
       });
   }

    override render(ctx: CanvasRenderingContext2D) {
      this.battleState.render(ctx);
   }

    override update(delta: number) {
      if (this.allowUserInput && this.game.anyKeyDown()) {
         this.game.setState(new FadeOutInState(this, new TitleScreenState(this.game)));
      }
   }
}
