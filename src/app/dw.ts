/*
 * Game bootstrap code.  This can be in an inline <script> tag as well.
 */
import DwGame from './dw/DwGame';
import { LoadingState } from './dw/LoadingState';

const SCALE: number = 2;
const tileSize: number = 16 * SCALE;
const CANVAS_WIDTH: number = tileSize * 17; // TODO: No magic numbers for row/column sizes
const CANVAS_HEIGHT: number = tileSize * 15;

(window as any).init = function(parent: HTMLElement, assetRoot?: string) {

    const gameWindow: any = window as any;

    gameWindow.game = new DwGame({ parent: parent, scale: SCALE, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
         assetRoot: assetRoot, keyRefreshMillis: 300, targetFps: 60 });
    gameWindow.game.setState(new LoadingState());
    gameWindow.game.start();
};
