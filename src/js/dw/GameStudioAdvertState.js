dw.GameStudioAdvertState = function() {
   'use strict';
   dw._BaseState.apply(this, arguments);
};

dw.GameStudioAdvertState.prototype = Object.create(dw._BaseState.prototype, {
   
   init: {
      value: function() {
         'use strict';
         dw._BaseState.prototype.init.apply(this, arguments);
         this._delay = new gtp.Delay({ millis: 3000 });
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
         
         this.handleDefaultKeys();
         
         if (this._delay.update(delta) || game.anyKeyDown(true)) {
            this._startGame();
         }
         
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         game.clearScreen();
         var w = game.getWidth();
         
//         var img = game.assets.get('gameStudioLogo');
//         var x = (w - img.width) / 2;
//         var y = 30;
//         img.draw(ctx, x, y);
         
         var prompt = 'OutOnBail Games Presents';
         var x = (w - game.stringWidth(prompt)) / 2;
         var y = (game.getHeight() - game.stringHeight()) / 2;
         game.drawString(prompt, x, y);
      }
   },
   
   _startGame: {
      value: function() {
         'use strict';
         game.setState(new gtp.FadeOutInState(this, new dw.TitleScreenState()));
      }
   }
   
});

dw.GameStudioAdvertState.prototype.constructor = dw.GameStudioAdvertState;
