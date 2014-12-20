var _RoamingSubState = Object.freeze({
   ROAMING: 0,
   MENU: 1,
   TALKING: 2
});

var RoamingState = function() {
   'use strict';
   
   _BaseState.apply(this, arguments);
   this._substate = _RoamingSubState.ROAMING;
   
   this._updateMethods = {};
   this._updateMethods[_RoamingSubState.ROAMING] = this._updateRoaming;
   this._updateMethods[_RoamingSubState.MENU] = this._updateMenu;
   this._updateMethods[_RoamingSubState.TALKING] = this._updateTalking;
   
   this._textBubble = new TextBubble(game);
   this._showTextBubble = false;
   
   this._commandBubble = new CommandBubble();
   this._statBubble = new StatBubble();
   this._stationaryTimer = new gtp.Delay({ millis: 1000 });
};

RoamingState.prototype = Object.create(_BaseState.prototype, {
   
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
         
         game.hero.update(delta);
         
         RoamingState._totalTime += delta;
         if (RoamingState._totalTime>=1000) {
            RoamingState._totalTime = 0;
         }
         
         this._updateMethods[this._substate].call(this, delta);
      }
   },
   
   _updateMenu: {
      value: function(delta) {
         'use strict';
         
         //var im = game.inputManager;
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
         
         // Make sure we're not in BattleTransitionState
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
         if (this._showTextBubble) {
            this._textBubble.update(delta);
         }
         
         if (done) {
            this.startRoaming();
            return;
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
         
         var conversation = new Conversation();
         
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

RoamingState.prototype.constructor = RoamingState;
