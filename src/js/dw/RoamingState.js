var _RoamingSubState = Object.freeze({
   ROAMING: 0,
   MENU: 1,
   TALKING: 2,
   OVERNIGHT: 3
});

dw.RoamingState = function() {
   'use strict';
   
   dw._BaseState.apply(this, arguments);
   
   this._commandBubble = new dw.CommandBubble();
   this._statBubble = new dw.StatBubble();
   this._stationaryTimer = new gtp.Delay({ millis: 1000 });
   
   this._setSubstate(_RoamingSubState.ROAMING);
   
   this._updateMethods = {};
   this._updateMethods[_RoamingSubState.ROAMING] = this._updateRoaming;
   this._updateMethods[_RoamingSubState.MENU] = this._updateMenu;
   this._updateMethods[_RoamingSubState.TALKING] = this._updateTalking;
   this._updateMethods[_RoamingSubState.OVERNIGHT] = this._updateOvernight;
   
   this._textBubble = new dw.TextBubble(game);
   this._showTextBubble = false;
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
         if (game.inputManager.isKeyDown(gtp.Keys.KEY_R, true)) {
            game.startRandomEncounter();
            return;
         }
         else if (game.inputManager.isKeyDown(gtp.Keys.KEY_O, true)) {
            this._setSubstate(_RoamingSubState.OVERNIGHT);
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
         
         if (this._statusBubble) {
            this._statusBubble.update(delta);
            if (game.anyKeyDown()) {
               delete this._statusBubble;
               return;
            }
         }

         var done;
         if (this._itemBubble) {
            this._itemBubble.update(delta);
            done = this._itemBubble.handleInput();
            if (done) {
               var selectedItem = this._itemBubble.getAndRemoveSelectedItem();
               delete this._itemBubble;
               var success = selectedItem.use();
               if (success) {
                  this._setSubstate(_RoamingSubState.ROAMING);
               }
            }
            return;
         }
         
         this._commandBubble.update(delta);
         done = this._commandBubble.handleInput();
         if (done) {
            this._commandBubble.handleCommandChosen(this);
            return;
         }
      }
   },
   
   _updateRoaming: {
      value: function(delta) {
         'use strict';
         
         if (this._substate!==_RoamingSubState.ROAMING || this._showStats) {
            this._statBubble.update(delta);
         }
         
         var hero = game.hero;
         var im = game.inputManager;
         
         if (game.actionKeyPressed()) {
            game.setNpcsPaused(true);
            this._commandBubble.reset();
            game.audio.playSound('menu');
            this._setSubstate(_RoamingSubState.MENU);
            return;
         }
         
         // Make sure we're not in dw.BattleTransitionState
         if (!hero.isMoving() && game.state===this) {
            
            if (im.up()) {
               hero.tryToMoveUp();
               this._stationaryTimer.reset();
               this._statBubble.init();
               //this.yOffs = Math.max(this.yOffs-inc, 0);
            }
            else if (im.down()) {
               hero.tryToMoveDown();
               this._stationaryTimer.reset();
               this._statBubble.init();
               //this.yOffs = Math.min(this.yOffs+inc, maxY);
            }
            else if (im.left()) {
               hero.tryToMoveLeft();
               this._stationaryTimer.reset();
               this._statBubble.init();
               //this.xOffs = Math.max(this.xOffs-inc, 0);
            }
            else if (im.right()) {
               hero.tryToMoveRight();
               this._stationaryTimer.reset();
               this._statBubble.init();
               //this.xOffs = Math.min(this.xOffs+inc, maxX);
            }
            
         }
         
         this._showStats = this._stationaryTimer.update(delta);
         
         if (im.isKeyDown(gtp.Keys.KEY_SHIFT)) {
            if (im.isKeyDown(gtp.Keys.KEY_C, true)) {
               game.toggleShowCollisionLayer();
            }
            if (im.isKeyDown(gtp.Keys.KEY_T, true)) {
               game.toggleShowTerritoryLayer();
            }
            if (im.isKeyDown(gtp.Keys.KEY_S, true)) {
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
            this._setSubstate(_RoamingSubState.OVERNIGHT);
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
         this._setSubstate(_RoamingSubState.TALKING);
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
            this._setSubstate(_RoamingSubState.TALKING);
         }
         else {
            this._setSubstate(_RoamingSubState.ROAMING);
         }
      }
   },
   
   _possiblyRenderNpc: {
      value: function(npc, ctx) {
         'use strict';
         var row = npc.mapRow;
         var col = npc.mapCol;
         var underRoof = game.hasRoofTile(row, col);
         if ((underRoof && game.inside) || (!underRoof && !game.inside)) {
            npc.render(ctx);
         }
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         if (game.map.properties.requiresTorch) {
            game.clearScreen('#000000');
            ctx.save();
            var clipRadius;
            if (game.getUsingTorch()) {
               clipRadius = game.getTileSize() * 3 / 2;
            }
            else {
               clipRadius = game.getTileSize() / 2;
            }
            var x0 = game.getWidth() / 2 - clipRadius;
            var y0 = game.getHeight() / 2 - clipRadius;
            ctx.beginPath();
            ctx.rect(x0, y0, 2 * clipRadius, 2 * clipRadius);
            ctx.clip();
         }
         else if (game.inside) {
            game.clearScreen('#000000');
         }
         
         game.drawMap(ctx);
         game.hero.render(ctx);
         
         var self = this;
         game.map.npcs.forEach(function(npc) {
            self._possiblyRenderNpc(npc, ctx);
         });
         
         if (game.map.properties.requiresTorch) {
            ctx.restore();
         }
         
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
   
   _setSubstate: {
      value: function(substate) {
         'use strict';
         var prevSubstate = this._substate;
         this._substate = substate;
         this._statBubble.init(); // Reset this guy
         if (substate === _RoamingSubState.MENU) {
            this._commandBubble.init();
         }
         else if (substate === _RoamingSubState.TALKING &&
               prevSubstate !== _RoamingSubState.OVERNIGHT) {
            this._textBubble.init();
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
         this._setSubstate(_RoamingSubState.ROAMING);
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
         this._setSubstate(_RoamingSubState.TALKING);
      }
   }
   
});

dw.RoamingState.prototype.constructor = dw.RoamingState;
