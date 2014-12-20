/**
 * Functionality common amongst all states in this game.
 * @constructor
 */
_BaseState = function(args) {
   'use strict';
   gtp.State.apply(this, args);
};

_BaseState.prototype = Object.create(gtp.State.prototype, {
   
   createScreenshot: {
      value: function() {
         'use strict';
         var canvas = gtp.ImageUtils.createCanvas(game.getWidth(), game.getHeight());
         var ctx = canvas.getContext('2d');
         this.render(ctx);
         return canvas;
      }
   },
   
   handleDefaultKeys: {
      value: function() {
         'use strict';
         
         var im = this.game.inputManager;
         
         if (im.isKeyDown(gtp.Keys.SHIFT)) {
            if (im.isKeyDown(gtp.Keys.P, true)) {
               if (!game.canvas.style.width) {
                  game.canvas.style.width = game.canvas.width + 'px';
               }
               if (!game.canvas.style.height) {
                  game.canvas.style.height = game.canvas.height + 'px';
               }
               game.canvas.style.width = (parseInt(game.canvas.style.width.substring(0, game.canvas.style.width.length-2), 10)+1) + 'px';
               game.canvas.style.height = (parseInt(game.canvas.style.height.substring(0, game.canvas.style.height.length-2), 10)+1) + 'px';
            }
            else if (im.isKeyDown(gtp.Keys.L, true)) {
               if (!game.canvas.style.width) {
                  game.canvas.style.width = game.canvas.width + 'px';
               }
               if (!game.canvas.style.height) {
                  game.canvas.style.height = game.canvas.height + 'px';
               }
               console.log('... ' + game.canvas.width + ', ' + game.canvas.style.width + ', ' + (game.canvas.style.width.substring(0, game.canvas.style.width-2)));
               game.canvas.style.width = (parseInt(game.canvas.style.width.substring(0, game.canvas.style.width.length-2), 10)-1) + 'px';
               game.canvas.style.height = (parseInt(game.canvas.style.height.substring(0, game.canvas.style.height.length-2), 10)-1) + 'px';
            }
            else if (im.isKeyDown(gtp.Keys.M, true)) {
               game.toggleMuted();
            }
         }
         
      }
   }
   
});

_BaseState.prototype.constructor = _BaseState;
