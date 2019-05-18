/*
 * Game bootstrap code.  This can be in an inline <script> tag as well.
 */
const SCALE = 2;
const tileSize = 16 * SCALE;
const CANVAS_WIDTH = tileSize * 17; // TODO: No magic numbers for row/column sizes
const CANVAS_HEIGHT = tileSize * 15;

(window as any).init = function(parent: HTMLElement, assetRoot?: string) { // tslint:disable-line

    const gameWindow: any = window as any;

    gameWindow.game = new dw.DwGame({ parent: parent, scale: SCALE, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
         assetRoot: assetRoot, keyRefreshMillis: 300, targetFps: 60 });
    gameWindow.game.setState(new dw.LoadingState());
    gameWindow.game.start();
};
