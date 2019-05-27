import { _BaseState } from './_BaseState';
import { FadeOutInState } from 'gtp';
import DwGame from './DwGame';
import { TitleScreenState } from './TitleScreenState';
import BattleState from './BattleState';

export default class DeadState extends _BaseState {

   private readonly _battleState: BattleState;

   constructor(game: DwGame, battleState: BattleState) {
      super(game);
      this._battleState = battleState;
   }

   init() {
      this.game.audio.playMusic(null);
      this.game.audio.playSound('dead');
      // TODO: Event when a sound effect has completed
   }

   render(ctx: CanvasRenderingContext2D) {

      this._battleState.render(ctx);
   }

   update(delta: number) {

      if (this.game.anyKeyDown()) {
         this.game.setState(new FadeOutInState(this, new TitleScreenState()));
      }
   }
}
