import { _BaseState } from './_BaseState';
import { FadeOutInState } from 'gtp';
import DwGame from './DwGame';
import { TitleScreenState } from './TitleScreenState';
import BattleState from './BattleState';

export default class DeadState extends _BaseState {

   private readonly _battleState: BattleState;
   private allowUserInput?: boolean;

   constructor(game: DwGame, battleState: BattleState) {
      super(game);
      this._battleState = battleState;
       this.game.audio.playMusic(null);
       this.game.audio.playSound('dead', false, () => {
           this.allowUserInput = true;
       });
   }

    override render(ctx: CanvasRenderingContext2D) {
      this._battleState.render(ctx);
   }

    override update(delta: number) {
      if (this.allowUserInput && this.game.anyKeyDown()) {
         this.game.setState(new FadeOutInState(this, new TitleScreenState()));
      }
   }
}
