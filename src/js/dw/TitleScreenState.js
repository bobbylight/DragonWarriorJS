var TitleScreenState = function() {
   'use strict';
   _BaseState.apply(this, arguments);
   this.assetsLoaded = false;
};

TitleScreenState.prototype = Object.create(_BaseState.prototype, {
   
   init: {
      value: function() {
         'use strict';
         _BaseState.prototype.init.apply(this, arguments);
         game.canvas.addEventListener('touchstart', this.handleStart, false);
         this._delay = new gtp.Delay({ millis: [ 600, 400 ] });
         this._blink = true;
         game.audio.playMusic(Sounds.MUSIC_TITLE_SCREEN);
      }
   },
   
   leaving: {
      value: function(game) {
         'use strict';
         game.canvas.removeEventListener('touchstart', this.handleStart, false);
      }
   },
   
handleStart: {
   value: function() {
      'use strict';
      console.log('yee, touch detected!');
      this._startGame();
   }
},

   update: {
      value: function(delta) {
         'use strict';
         
         this.handleDefaultKeys();
         
         if (this._delay.update(delta)) {
            this._delay.reset();
            this._blink = !this._blink;
         }
         
         var im = game.inputManager;
         if (im.enter()) {
            this._startGame();
         }
         
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         var game = this.game;
         game.clearScreen();
         var w = game.getWidth();
         
         var img = game.assets.get('title');
         var x = (w - img.width) / 2;
         var y = 30;
         img.draw(ctx, x, y);
         
         if (game.audio.isInitialized()) {
            var text = 'Sound is disabled as your';
            x = ( w - game.stringWidth(text)) / 2;
            y = 390;
            game.drawString(text, x, y);
            text = 'browser does not support';
            x = ( w - game.stringWidth(text)) / 2;
            y += 26;
            game.drawString(text, x, y);
            text = 'web audio';
            x = (w - game.stringWidth(text)) / 2;
            y += 26;
            game.drawString(text, x, y);
         }
         
         if (this._blink) {
            var prompt = 'Press Enter';
            x = (w - game.stringWidth(prompt)) / 2;
            y = 240;
            game.drawString(prompt, x, y);
         }
      }
   },
   
   _adjustGameMap: {
      
      value: function() {
         'use strict';
         
         var map = game.map;
         
         // Hide layers that shouldn't be shown (why aren't they marked as hidden
         // in Tiled?)
         for (var i=0; i<map.getLayerCount(); i++) {
            var layer = map.getLayerByIndex(i);
            if (layer.name !== 'tileLayer') {
               layer.visible = false;
            }
         }
      }
      
   },
   
   _startGame: {
      value: function() {
         'use strict';
         game.startNewGame();
      }
   }
   
});

TitleScreenState.prototype.constructor = TitleScreenState;
