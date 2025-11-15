/**
 * Transitions from one map to another, lazily loading map-specific resources
 * if necessary.
 */
import { FadeOutInState } from 'gtp';
import { DwGame } from './DwGame';

export class MapChangeState extends FadeOutInState<DwGame> {

//     constructor(leavingState: State<DwGame>, enteringState: State<DwGame>, transitionLogic?: Function,
//                 timeMillis?: number) {
//         super(leavingState, enteringState, transitionLogic, timeMillis);
//
// // TODO: Dynamically load scripts?
// //         const mapLogic: string = game.map.getProperty('logicFile');
// //         if (!game.hasLogic(mapLogic)) {
// //            game.assets
// //         }
//
//       }

   // private _setState(state: State) {
   //       this.game.getMapLogic().init();
   //     super._setState(state);
   //    }
   // }

}
