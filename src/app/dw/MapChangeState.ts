/**
 * Transitions from one map to another, lazily loading map-specific resources
 * if necessary.
 */
import { FadeOutInState, State } from 'gtp';

export default class MapChangeState extends FadeOutInState {

    constructor(leavingState: State, enteringState: State, transitionLogic?: Function, timeMillis?: number) {
        super(leavingState, enteringState, transitionLogic, timeMillis);

// TODO: Dynamically load scripts?
//         var mapLogic = game.map.properties.logicFile;
//         if (!game.hasLogic(mapLogic)) {
//            game.assets
//         }

      }

   // private _setState(state: State) {
   //       this.game.getMapLogic().init();
   //     super._setState(state);
   //    }
   // }

}
