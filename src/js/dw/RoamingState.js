var _RoamingSubState = Object.freeze({
   ROAMING: 0,
   MENU: 1,
   TALKING: 2,
   OVERNIGHT: 3
});

dw.RoamingState = function() {
   'use strict';
   
   dw._BaseState.apply(this, arguments);
   this._substate = _RoamingSubState.ROAMING;
   
   this._updateMethods = {};
   this._updateMethods[_RoamingSubState.ROAMING] = this._updateRoaming;
   this._updateMethods[_RoamingSubState.MENU] = this._updateMenu;
   this._updateMethods[_RoamingSubState.TALKING] = this._updateTalking;
   this._updateMethods[_RoamingSubState.OVERNIGHT] = this._updateOvernight;
   
   this._textBubble = new dw.TextBubble(game);
   this._showTextBubble = false;
   
   this._commandBubble = new dw.CommandBubble();
   this._statBubble = new dw.StatBubble();
   this._stationaryTimer = new gtp.Delay({ millis: 1000 });
};

dw.RoamingState.prototype = Object.create(dw._BaseState.prototype, {
   
   _OVERNIGHT_DARK_TIME: {
      value: 2500,
      writable: false
   },
   
   _OVERNIGHT_FADE_TIME: {
      value: 500,
      writable: false
   },
   
   _totalTime: {
      value: 0,
      writable: true
   },

   update: {
      value: function(delta) {
         'use strict';

         this.handleDefaultKeys();
         if (game.inputManager.isKeyDown(gtp.Keys.R, true)) {
            game.startRandomEncounter();
            return;
         }
         else if (game.inputManager.isKeyDown(gtp.Keys.O, true)) {
            this._substate = _RoamingSubState.OVERNIGHT;
         }
         
         game.hero.update(delta);
         
         dw.RoamingState._totalTime += delta;
         if (dw.RoamingState._totalTime>=1000) {
            dw.RoamingState._totalTime = 0;
         }
         
         this._updateMethods[this._substate].call(this, delta);
      }
   },
   
   _updateMenu: {
      value: function(delta) {
         'use strict';
         
         if (this._statusBubble && game.anyKeyDown()) {
            delete this._statusBubble;
            return;
         }
         
         if (this._itemBubble) {
            if (game.anyKeyDown()) {
               delete this._itemBubble;
            }
            return;
         }
         
         var done = this._commandBubble.handleInput();
         if (done) {
            this._commandBubble.handleCommandChosen(this);
            return;
         }
      }
   },
   
   _updateRoaming: {
      value: function(delta) {
         'use strict';
         
         var hero = game.hero;
         var im = game.inputManager;
         
         if (game.actionKeyPressed()) {
            game.setNpcsPaused(true);
            this._commandBubble.reset();
            game.audio.playSound('menu');
            this._substate = _RoamingSubState.MENU;
            return;
         }
         
         // Make sure we're not in dw.BattleTransitionState
         if (!hero.isMoving() && game.state===this) {
            
            if (im.up()) {
               hero.tryToMoveUp();
               this._stationaryTimer.reset();
               //this.yOffs = Math.max(this.yOffs-inc, 0);
            }
            else if (im.down()) {
               hero.tryToMoveDown();
               this._stationaryTimer.reset();
               //this.yOffs = Math.min(this.yOffs+inc, maxY);
            }
            else if (im.left()) {
               hero.tryToMoveLeft();
               this._stationaryTimer.reset();
               //this.xOffs = Math.max(this.xOffs-inc, 0);
            }
            else if (im.right()) {
               hero.tryToMoveRight();
               this._stationaryTimer.reset();
               //this.xOffs = Math.min(this.xOffs+inc, maxX);
            }
            
         }
         
         this._showStats = this._stationaryTimer.update(delta);
         
         if (im.isKeyDown(gtp.Keys.SHIFT)) {
            if (im.isKeyDown(gtp.Keys.C, true)) {
               game.toggleShowCollisionLayer();
            }
            if (im.isKeyDown(gtp.Keys.T, true)) {
               game.toggleShowTerritoryLayer();
            }
            if (im.isKeyDown(gtp.Keys.S, true)) {
               game.audio.playSound('stairs');
            }
         }
         
         game.map.npcs.forEach(function(npc) {
            npc.update(delta);
         });
         
      }
   },
   
   _updateTalking: {
      value: function(delta) {
         'use strict';
         
         var done = this._textBubble.handleInput();
         if (/*this._textBubble.currentTextDone() && */this._textBubble.isOvernight()) {
            this._substate = _RoamingSubState.OVERNIGHT;
            this._textBubble.clearOvernight();
         }
         else if (this._showTextBubble) {
            this._textBubble.update(delta);
         }
         
         if (done) {
            this.startRoaming();
            return;
         }
      }
   },
   
   _updateOvernight: {
      value: function(delta) {
         'use strict';
         
         if (this._overnightDelay) {
            this._overnightDelay.update(delta);
         }
         else {
            game.audio.playMusic('overnight', false);
            this._overnightDelay = new gtp.Delay({ millis: [ this._OVERNIGHT_DARK_TIME ],
                  callback: gtp.Utils.hitch(this, this._overnightOver) });
         }
      }
   },
   
   _overnightOver: {
      value: function() {
         'use strict';
         game.audio.playMusic(dw.Sounds.MUSIC_TOWN);
         delete this._overnightDelay;
         this._substate = _RoamingSubState.TALKING;
//         this._textBubble.nudgeConversation(); // User doesn't have to press a key
      }
   },
   
   openDoor: {
      value: function() {
         'use strict';
         if (!game.openDoorHeroIsFacing()) {
            var conversation = new dw.Conversation();
            conversation.addSegment('There is no door there to open!');
            this._showTextBubble = true;
            this._textBubble.setConversation(conversation);
            this._substate = _RoamingSubState.TALKING;
         }
         else {
            this._substate = _RoamingSubState.ROAMING;
         }
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         game.drawMap(ctx);
         game.hero.render(ctx);
         
         game.map.npcs.forEach(function(npc) {
            npc.render(ctx);
         });
         
         if (this._substate===_RoamingSubState.MENU) {
            this._commandBubble.paint(ctx);
         }
         
         if (this._showTextBubble) {
            this._textBubble.paint(ctx);
         }
         
         if (this._substate!==_RoamingSubState.ROAMING || this._showStats) {
            this._statBubble.paint(ctx);
         }
         if (this._statusBubble) {
            this._statusBubble.paint(ctx);
         }
         if (this._itemBubble) {
            this._itemBubble.paint(ctx);
         }
         
         if (this._overnightDelay) {
            ctx.save();
            var overnightRemaining = this._overnightDelay.getRemaining();
            var alpha, fadeInTime = this._OVERNIGHT_FADE_TIME;
            if (overnightRemaining > (this._OVERNIGHT_DARK_TIME - fadeInTime)) {
               alpha = (this._OVERNIGHT_DARK_TIME - overnightRemaining) / fadeInTime;
               ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            }
            else if (overnightRemaining < fadeInTime) {
               alpha = overnightRemaining / fadeInTime;
               ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            }
            else {
               ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            }
            ctx.fillRect(0, 0, game.getWidth(), game.getHeight());
            ctx.restore();
         }
      }
   },
   
   showInventory: {
      value: function() {
         'use strict';
         this._itemBubble = new dw.ItemBubble();
      }
   },
   
   showStatus: {
      value: function() {
         'use strict';
         this._statusBubble = new dw.StatusBubble();
      }
   },
   
   startRoaming: {
      value: function() {
         'use strict';
         game.setNpcsPaused(false);
         this._showTextBubble = false;
         this._substate = _RoamingSubState.ROAMING;
         this._stationaryTimer.reset();
      }
   },
   
   talkToNpc: {
      value: function() {
         'use strict';
         
         var logic = game.getMapLogic();
         if (!logic) {
            console.log('Error: No map logic found for this map!  Cannot talk to NPCs!');
            return;
         }
         
         var conversation = new dw.Conversation();
         
         var npc = game.getNpcHeroIsFacing();
         if (npc) {
            var hero = game.hero;
            //var newNpcDir = this.getHero().direction.opposite();
            var newNpcDir = (hero.direction + 2) % 4;
            npc.direction = newNpcDir;
            conversation.setSegments(logic.npcText(npc));
         }
         else {
            conversation.addSegment('There is nobody in that direction!');
         }
         this._showTextBubble = true;
         this._textBubble.setConversation(conversation);
         this._substate = _RoamingSubState.TALKING;
      }
   }
   
});

dw.RoamingState.prototype.constructor = dw.RoamingState;
