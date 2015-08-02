/*
 * Game bootstrap code.  This can be in an inline <script> tag as well.
 */
var SCALE = 2;
var tileSize = 16 * SCALE;
var CANVAS_WIDTH = tileSize*17; // TODO: No magic numbers for row/column sizes
var CANVAS_HEIGHT = tileSize*15;
var game;

var dw = {};

function init(parent, assetRoot) {
   'use strict';
   game = new dw.DwGame({ parent: parent, scale: SCALE, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
         assetRoot: assetRoot, keyRefreshMillis: 300, targetFps: 60 });
   game.setState(new dw.LoadingState());
   game.start();
}
