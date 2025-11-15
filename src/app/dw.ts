/*
 * Game bootstrap code.  This can be in an inline <script> tag as well.
 */
import { DwGame } from './dw/DwGame';
import { LoadingState } from './dw/LoadingState';

const SCALE = 2;
const tileSize: number = 16 * SCALE;
const CANVAS_WIDTH: number = tileSize * 17; // TODO: No magic numbers for row/column sizes
const CANVAS_HEIGHT: number = tileSize * 15;

declare global {
    interface Window {
        game?: DwGame;
        init: (parent: HTMLElement, assetRoot?: string) => void;
    }
}

window.init = function(parent: HTMLElement, assetRoot?: string) {
    window.game = new DwGame({ parent: parent, scale: SCALE, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
        assetRoot: assetRoot, keyRefreshMillis: 300, targetFps: 60 });
    window.game.setState(new LoadingState(window.game));
    window.game.start();
};
