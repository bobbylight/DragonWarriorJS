/**
 * Transitions from the map to a battle
 */
var BattleTransitionState = function(leavingState, enteringState) {
   'use strict';
   _BaseState.apply(this, arguments);
   
   this._enteringState = enteringState;
   this._enteringStateScreenshot = enteringState.createScreenshot();
};

BattleTransitionState.prototype = Object.create(_BaseState.prototype, {
   
   _TICK_COUNT: {
      value: 25
   },
   
   init: {
      value: function() {
         'use strict';
         gtp.State.prototype.init.apply(this, arguments); // Not defined in super, but in parent of super (?)
         
// TODO: Dynamically load scripts?
//         var mapLogic = game.map.properties.logicFile;
//         if (!game.hasLogic(mapLogic)) {
//            game.assets
//         }
         
         this.state = 0;
         this.tick = 0;
         game.audio.playMusic(Sounds.MUSIC_BATTLE);
         
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         game.drawMap(ctx);
         this._renderBattleBG(ctx);
      }
   },
   
   _renderBattleBG: {
      value: function(ctx) {
         'use strict';
         
         var w = game.getWidth();
         var h = game.getHeight();
         
         var cx = w/2;
         var cy = h/2;
         var xts = this._enteringStateScreenshot.width / 5;
         var yts = this._enteringStateScreenshot.height / 5;
   
         var x = [ cx-2*xts-xts/2, cx-xts-xts/2, cx-xts/2, cx+xts/2, cx+xts+xts/2 ];
         var y = [ cy-2*yts-yts/2, cy-yts-yts/2, cy-yts/2, cy+yts/2, cy+yts+xts/2 ];
         
         switch (this.state) {
   
            case 25:
               ctx.drawImage(this._enteringStateScreenshot, x[0],y[0],x[4]+xts-x[0],y[4]+yts-y[0], x[0],y[0],x[4]+xts-x[0],y[4]+yts-y[0]);
               break;
            case 24:
               ctx.drawImage(this._enteringStateScreenshot, x[4],y[1],x[4]+xts-x[4],y[2]-y[1], x[4],y[1],x[4]+xts-x[4],y[2]-y[1]);
               /* falls through */
            case 23:
               ctx.drawImage(this._enteringStateScreenshot, x[4],y[2],x[4]+xts-x[4],y[3]-y[2], x[4],y[2],x[4]+xts-x[4],y[3]-y[2]);
               /* falls through */
            case 22:
               ctx.drawImage(this._enteringStateScreenshot, x[4],y[3],x[4]+xts-x[4],y[4]-y[3], x[4],y[3],x[4]+xts-x[4],y[4]-y[3]);
               /* falls through */
            case 21:
               ctx.drawImage(this._enteringStateScreenshot, x[4],y[4],x[4]+xts-x[4],y[4]+yts-y[4], x[4],y[4],x[4]+xts-x[4],y[4]+yts-y[4]);
               /* falls through */
            case 20:
               ctx.drawImage(this._enteringStateScreenshot, x[0],y[0],x[4]-x[0],y[4]+yts-y[0], x[0],y[0],x[4]-x[0],y[4]+yts-y[0]);
               break;
            case 19:
               ctx.drawImage(this._enteringStateScreenshot, x[2],y[4],x[3]-x[2],y[4]+yts-y[4], x[2],y[4],x[3]-x[2],y[4]+yts-y[4]);
               /* falls through */
            case 18:
               ctx.drawImage(this._enteringStateScreenshot, x[1],y[4],x[2]-x[1],y[4]+yts-y[4], x[1],y[4],x[2]-x[1],y[4]+yts-y[4]);
               /* falls through */
            case 17:
               ctx.drawImage(this._enteringStateScreenshot, x[0],y[4],x[1]-x[0],y[4]+yts-y[4], x[0],y[4],x[1]-x[0],y[4]+yts-y[4]);
               /* falls through */
            case 16:
               ctx.drawImage(this._enteringStateScreenshot, x[0],y[3],x[1]-x[0],y[4]-y[3], x[0],y[3],x[1]-x[0],y[4]-y[3]);
               /* falls through */
            case 15:
               ctx.drawImage(this._enteringStateScreenshot, x[0],y[2],x[1]-x[0],y[3]-y[2], x[0],y[2],x[1]-x[0],y[3]-y[2]);
               /* falls through */
            case 14:
               ctx.drawImage(this._enteringStateScreenshot, x[0],y[1],x[1]-x[0],y[2]-y[1], x[0],y[1],x[1]-x[0],y[2]-y[1]);
               /* falls through */
            case 13:
               ctx.drawImage(this._enteringStateScreenshot, x[0],y[0],x[1]-x[0],y[1]-y[0], x[0],y[0],x[1]-x[0],y[1]-y[0]);
               /* falls through */
            case 12:
               ctx.drawImage(this._enteringStateScreenshot, x[1],y[0],x[4]-x[1],y[4]-y[0], x[1],y[0],x[4]-x[1],y[4]-y[0]);
               break;
            case 11:
               ctx.drawImage(this._enteringStateScreenshot, x[2],y[0],x[3]-x[2],y[1]-y[0], x[2],y[0],x[3]-x[2],y[1]-y[0]);
               /* falls through */
            case 10:
               ctx.drawImage(this._enteringStateScreenshot, x[3],y[0],x[4]-x[3],y[1]-y[0], x[3],y[0],x[4]-x[3],y[1]-y[0]);
               /* falls through */
            case 9:
               ctx.drawImage(this._enteringStateScreenshot, x[1],y[1],x[4]-x[1],y[4]-y[1], x[1],y[1],x[4]-x[1],y[4]-y[1]);
               break;
            case 8:
               ctx.drawImage(this._enteringStateScreenshot, x[3],y[2],x[4]-x[3],y[3]-y[2], x[3],y[2],x[4]-x[3],y[3]-y[2]);
               /* falls through */
            case 7:
               ctx.drawImage(this._enteringStateScreenshot, x[3],y[3],x[4]-x[3],y[4]-y[3], x[3],y[3],x[4]-x[3],y[4]-y[3]);
               /* falls through */
            case 6:
               ctx.drawImage(this._enteringStateScreenshot, x[1],y[1],x[3]-x[1],y[4]-y[1], x[1],y[1],x[3]-x[1],y[4]-y[1]);
               break;
            case 5:
               ctx.drawImage(this._enteringStateScreenshot, x[1],y[3],x[2]-x[1],y[4]-y[3], x[1],y[3],x[2]-x[1],y[4]-y[3]);
               /* falls through */
            case 4:
               ctx.drawImage(this._enteringStateScreenshot, x[1],y[1],x[3]-x[1],y[3]-y[1], x[1],y[1],x[3]-x[1],y[3]-y[1]);
               break;
            case 3:
               ctx.drawImage(this._enteringStateScreenshot, x[1],y[1],x[2]-x[1],y[2]-y[1], x[1],y[1],x[2]-x[1],y[2]-y[1]);
               /* falls through */
            case 2:
               ctx.drawImage(this._enteringStateScreenshot, x[2],y[1],x[3]-x[2],y[3]-y[1], x[2],y[1],x[3]-x[2],y[3]-y[1]);
               break;
            case 1:
               ctx.drawImage(this._enteringStateScreenshot, x[2],y[2],x[3]-x[2],y[3]-y[2], x[2],y[2],x[3]-x[2],y[3]-y[2]);
               break;
         }
   
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
         
         this.handleDefaultKeys();
         
         if (this.tick===0) {
            this.tick = game.getGameTime() + this._TICK_COUNT;
         }
         else {
            var time = game.getGameTime();
            if (time>=this.tick) {
               this.tick = time + this._TICK_COUNT;
               this.state++;
               if (this.state === 25) {
                  game.setState(this._enteringState);
               }
            }
         }
      }
   }
   
});

BattleTransitionState.prototype.constructor = BattleTransitionState;
