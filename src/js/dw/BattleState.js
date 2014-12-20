var BattleState = function() {
   'use strict';
   _BaseState.apply(this, arguments);
};

BattleState.prototype = Object.create(_BaseState.prototype, {
   
   _backToRoaming: {
      value: function() {
         'use strict';
         game.audio.fadeOutMusic(Sounds.MUSIC_OVERWORLD);
         game.setState(new RoamingState());
      }
   },
   
   fight: {
      value: function() {
         'use strict';
         this._commandExecuting = true;
         this._fightDelay = new gtp.Delay({ millis: [ 300 ], callback: gtp.Utils.hitch(this, this._fightCallback) });
         game.audio.playSound('attack');
         this._textBubble.addToConversation({ text: 'You attack!' });
      }
   },
   
   _fightCallback: {
      value: function(param) {
         'use strict';
         game.audio.playSound('hit');
         delete this._fightDelay;
         this._enemyFlashDelay = new gtp.Delay({ millis: 400, callback: gtp.Utils.hitch(this, this._enemyFlashCallback) });
         this._flashMillis = 0;
      }
   },
   
   _enemyFlashCallback: {
      value: function() {
         'use strict';
         delete this._enemyFlashDelay;
         
         var damage = 1;
         var dead = this._enemy.takeDamage(damage);
         
         var text = "Direct hit! Thy enemy's hit points have been reduced by " + damage + '.';
         if (dead) {
            text += '\nThou hast defeated the ' + this._enemy.name + '.';
            text += '\nThy experience increases by ' + this._enemy.xp + '.';
            text += '\nThy gold increases by ' + this._enemy.gp + '.';
            this._enemiesDead = true;
            
            game.hero.exp += this._enemy.xp;
            game.hero.gold += this._enemy.gp;
            
            // TODO: Check for level up
         }
         this._textBubble.addToConversation({ text: text });
            
         this._commandExecuting = false;
      }
   },
   
   init: {
      value: function() {
         'use strict';
         gtp.State.prototype.init.apply(this, arguments); // Not defined in super, but in parent of super (?)
         this._commandBubble = new BattleCommandBubble();
         this._commandExecuting = false;
         this._textBubble = new TextBubble(game);
         var conversation = new Conversation();
         this._enemy = new Enemy(game.getEnemy('Slime'));
         conversation.addSegment({ text: 'A ' + this._enemy.name + ' draws near!  Command?' });
         this._textBubble.setConversation(conversation);
         this._enemyAttackShake = 0;
         this._statBubble = new StatBubble();
      }
   },
   
   item: {
      value: function() {
         'use strict';
         this._textBubble.addToConversation({ text: 'Not implmented, command?' });
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         game.drawMap(ctx);
         var width = game.getWidth();
         var height = game.getHeight();
         var tileSize = game.getTileSize();
         
         var battleBG = game.assets.get('battleBG');
         var x = (width - battleBG.width)/2;
         var y = (height - battleBG.height)/2 - tileSize;
         battleBG.draw(ctx, x, y);
         
         if (this._enemy && !this._enemiesDead) {
            
            var flash = Math.round(this._flashMillis) % 40 > 20;
            var enemyImg = this._enemy.getImage(flash);
            x = (width - enemyImg.width) / 2;
            y += battleBG.height - tileSize/2 - enemyImg.height;
            enemyImg.draw(ctx, x, y);
            
            if (!this._commandExecuting) {
               if (this._textBubble && this._textBubble.isDone()) {
                  this._commandBubble.paint(ctx);
               }
            }
            if (this._statBubble) {
               this._statBubble.paint(ctx);
            }
            if (this._textBubble) {
               this._textBubble.paint(ctx);
            }
         
         }
         else if (this._enemiesDead) {
            if (this._statBubble) {
               this._statBubble.paint(ctx);
            }
            if (this._textBubble) {
               this._textBubble.paint(ctx);
            }
         }
         
      }
   },
   
   run: {
      value: function() {
         'use strict';
         this._commandExecuting = true;
         this._fightDelay = new gtp.Delay({ millis: [ 600 ], callback: gtp.Utils.hitch(this, this._runCallback) });
         game.audio.playSound('run');
         this._textBubble.addToConversation({ text: game.hero.name + ' started to run away.' });
      }
   },
   
   _runCallback: {
      value: function(param) {
         'use strict';
         delete this._fightDelay;
         var success = gtp.Utils.randomInt(0, 2) === 1;
         if (success) {
            this._commandExecuting = false;
            this._backToRoaming();
         }
         else {
            this._commandExecuting = false;
            this._commandBubble.reset();
            this._textBubble.addToConversation({ text: 'Couldn\'t run!' });
         }
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
         
         this.handleDefaultKeys();
         
         if (this._enemiesDead) {
            if (game.anyKeyDown()) {
               this._backToRoaming();
               return;
            }
         }
         
         if (this._fightDelay) {
            this._fightDelay.update(delta);
         }
         if (this._enemyFlashDelay) {
            this._flashMillis += delta;
            this._enemyFlashDelay.update(delta);
         }
         
         if (!this._textBubble.isDone()) {
            this._textBubble.handleInput();
            this._textBubble.update(delta);
         }
         else if (!this._commandExecuting && this._commandBubble.handleInput()) {
            this._commandBubble.handleCommandChosen(this);
         }
         
      }
   }
   
});

BattleState.prototype.constructor = BattleState;
