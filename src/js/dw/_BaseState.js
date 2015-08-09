/**
 * Functionality common amongst all states in this game.
 * @constructor
 */
dw._BaseState = function(args) {
   'use strict';
   gtp.State.apply(this, arguments);
};

dw._BaseState.prototype = Object.create(gtp.State.prototype, {
   
   createScreenshot: {
      value: function() {
         'use strict';
         var canvas = gtp.ImageUtils.createCanvas(game.getWidth(), game.getHeight());
         var ctx = canvas.getContext('2d');
         this.render(ctx);
         return canvas;
      }
   },
   
   _warpTo: {
      value: function(mapName, row, col, desc, dir) {
         'use strict';
         dir = dir || dw.Direction.SOUTH;
         game.loadMap(mapName, row, col, dir);
         game.setStatusMessage('Warping to ' + desc + '...');
      }
   },
   
   handleDefaultKeys: {
      value: function() {
         'use strict';
         
         var im = this.game.inputManager;
         
         // Debugging actions
         if (im.shift()) {
            
            // Increase canvas size
            if (im.isKeyDown(gtp.Keys.P, true)) {
               if (!game.canvas.style.width) {
                  game.canvas.style.width = game.canvas.width + 'px';
               }
               if (!game.canvas.style.height) {
                  game.canvas.style.height = game.canvas.height + 'px';
               }
               game.canvas.style.width = (parseInt(game.canvas.style.width.substring(0, game.canvas.style.width.length-2), 10)+1) + 'px';
               game.canvas.style.height = (parseInt(game.canvas.style.height.substring(0, game.canvas.style.height.length-2), 10)+1) + 'px';
               game.setStatusMessage('Canvas size now: (' + game.canvas.style.width + ', ' + game.canvas.style.height + ')');
            }
            
            // Decrease canvas size
            else if (im.isKeyDown(gtp.Keys.L, true)) {
               if (!game.canvas.style.width) {
                  game.canvas.style.width = game.canvas.width + 'px';
               }
               if (!game.canvas.style.height) {
                  game.canvas.style.height = game.canvas.height + 'px';
               }
               game.canvas.style.width = (parseInt(game.canvas.style.width.substring(0, game.canvas.style.width.length-2), 10)-1) + 'px';
               game.canvas.style.height = (parseInt(game.canvas.style.height.substring(0, game.canvas.style.height.length-2), 10)-1) + 'px';
               game.setStatusMessage('Canvas size now: (' + game.canvas.style.width + ', ' + game.canvas.style.height + ')');
            }
            
            // Warps
            else if (im.isKeyDown(gtp.Keys['1'], true)) {
               this._warpTo('brecconary', 15, 2, 'Brecconary', dw.Direction.EAST);
            }
            else if (im.isKeyDown(gtp.Keys['2'], true)) {
               this._warpTo('tantegelCastle', 15, 7, 'Tantegel Castle', dw.Direction.WEST);
            }
            else if (im.isKeyDown(gtp.Keys['3'], true)) {
               this._warpTo('tantegelCastle', 51, 11, 'the King at Tantegel Castle', dw.Direction.WEST);
            }
            else if (im.isKeyDown(gtp.Keys['4'], true)) {
               this._warpTo('erdricksCave1', 1, 1, "Erdrick's Cave");
            }
            
            // Audio stuff
            else if (im.isKeyDown(gtp.Keys.M, true)) {
               game.toggleMuted();
            }
            
            // Equipment testing
            else if (im.isKeyDown(gtp.Keys.W, true)) {
               game.cycleWeapon();
            }
            else if (im.isKeyDown(gtp.Keys.A, true)) {
               game.cycleArmor();
            }
            else if (im.isKeyDown(gtp.Keys.S, true)) {
               game.cycleShield();
            }
            
            // Stat testing
            else if (im.isKeyDown(gtp.Keys.H, true)) {
               if (im.ctrl()) {
                  game.setHeroStats(1, 1);
               }
               else {
                  game.setHeroStats(255, 255);
               }
            }
            else if (im.isKeyDown(gtp.Keys.K, true)) {
               if (im.ctrl()) {
                  game.setHeroStats(null, null, 0, 0);
               }
               else {
                  game.setHeroStats(null, null, 255, 255);
               }
            }
            
            // Options generally useful for debugging
            else if (im.isKeyDown(gtp.Keys.U, true)) {
               game.hero.setMoveIncrement(4);
               game.setStatusMessage('Hero speed === 4');
            }
            else if (im.isKeyDown(gtp.Keys.D, true)) {
               game.hero.setMoveIncrement(2);
               game.setStatusMessage('Hero speed === 2');
            }
            else if (im.isKeyDown(gtp.Keys.E, true)) {
               game.toggleRandomEncounters();
            }
         }
         
      }
   }
   
});

dw._BaseState.prototype.constructor = dw._BaseState;
