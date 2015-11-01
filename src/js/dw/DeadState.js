dw.DeadState = function(battleState) {
   'use strict';
   dw._BaseState.apply(this, arguments);
   this._battleState = battleState;
};

dw.DeadState.prototype = Object.create(dw._BaseState.prototype, {
   
   init: {
      value: function() {
         'use strict';
         game.audio.playMusic(null);
         game.audio.playSound('dead');
         // TODO: Event when a sound effect has completed
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         this._battleState.render(ctx);
         
         
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
         
         if (game.anyKeyDown()) {
            game.setState(new gtp.FadeOutInState(this, new dw.TitleScreenState()));
         }
      }
   }
   
});

dw.DeadState.prototype.constructor = dw.DeadState;
