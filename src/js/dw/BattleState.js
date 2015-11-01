dw.BattleState = function(enemyName) {
   'use strict';
   dw._BaseState.apply(this, arguments);
   this._enemyName = enemyName;
};

dw.BattleState.prototype = Object.create(dw._BaseState.prototype, {
   
   _backToRoaming: {
      value: function() {
         'use strict';
         game.audio.fadeOutMusic(dw.Sounds.MUSIC_OVERWORLD);
         game.setState(new dw.RoamingState());
      }
   },
   
   fight: {
      value: function() {
         'use strict';
         this._commandExecuting = true;
         this._fightDelay = new gtp.Delay({ millis: [ 300 ], callback: gtp.Utils.hitch(this, this._fightCallback) });
         this._textBubble.addToConversation({ text: 'You attack!', sound: 'attack' }, true);
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
         
         var damage = game.hero.computePhysicalAttackDamage(this._enemy);
         var dead = this._enemy.takeDamage(damage);
         
         var text = "Direct hit! Thy enemy's hit points have been reduced by " + damage + '.';
         this._textBubble.addToConversation({ text: text }, true);
         
         if (dead) {
            this._defeatedEnemy();
         }
         
         else {
            this._enemyAttack();
         }
         
      }
   },
   
   _defeatedEnemy: {
      value: function() {
         'use strict';
         
         var text = '\nThou hast defeated the ' + this._enemy.name + '.' +
                    '\nThy experience increases by ' + this._enemy.xp + '.' +
                    '\nThy gold increases by ' + this._enemy.gp + '.';
         this._enemiesDead = true;
         
         game.hero.exp += this._enemy.xp;
         game.party.gold += this._enemy.gp;
         
         // TODO: Check for level up
         
         this._textBubble.addToConversation({ text: text, music: 'victory' });
         this._commandExecuting = false;
      }
   },
   
   _enemyAttack: {
      value: function() {
         'use strict';
         console.log('_enemyAttack called');
         var text = 'The ' + this._enemy.name + ' attacks!';
         this._textBubble.addToConversation({ text: text, sound: 'prepareToAttack' }, true);
         var self = this;
         this._textBubble.onDone(function() {
            self._enemyAttackDelay = new gtp.Delay({ millis: 200, callback: gtp.Utils.hitch(self, self._enemyAttackCallback) });
         });
      }
   },
   
   _enemyAttackCallback: {
      value: function() {
         'use strict';
         delete this._enemyAttackDelay;
         this._shake = true;
         game.audio.playSound('receiveDamage');
         this._enemyAttackShakeDelay = new gtp.Delay({ millis: 1000, callback: gtp.Utils.hitch(this, this._enemyAttackShakeCallback) });
         
      }
   },
   
   _enemyAttackShakeCallback: {
      value: function() {
         'use strict';
         
         delete this._enemyAttackShakeDelay;
         this._shake = false;
         
         var damage = this._enemy.ai(game.hero, this._enemy).damage;
         game.hero.takeDamage(damage);
         var text = 'Thy hit points are reduced by ' + damage + '.';
         if (game.hero.isDead()) {
            text += '\nThou art dead.';
            this._textBubble.addToConversation({ text: text }, true);
            this._dead = true;
         }
         else {
            text += '\nCommand?';
            this._textBubble.addToConversation({ text: text }, true);
         }
         
         this._commandExecuting = false;
      }
   },
   
   init: {
      value: function() {
         'use strict';
         gtp.State.prototype.init.apply(this, arguments); // Not defined in super, but in parent of super (?)
         this._commandBubble = new dw.BattleCommandBubble();
         this._commandExecuting = false;
         this._textBubble = new dw.TextBubble(game);
         var conversation = new dw.Conversation();
         this._enemy = new dw.Enemy(game.getEnemy(this._enemyName)).prepare();
         conversation.addSegment({ text: 'A ' + this._enemy.name + ' draws near!  Command?' });
         this._textBubble.setConversation(conversation);
         this._enemyAttackShake = 0;
         this._statBubble = new dw.StatBubble();
      }
   },
   
   item: {
      value: function() {
         'use strict';
         this._textBubble.addToConversation({ text: 'Not implemented, command?' });
      }
   },
   
   render: {
      value: function(ctx) {
         'use strict';
         
         if (this._shake) {
            game.setCameraOffset(this._shakeXOffs, 0);
         }
         game.drawMap(ctx);
         if (this._shake) {
            game.setCameraOffset(0, 0);
         }
         
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
         this._textBubble.addToConversation({ text: game.hero.name + ' started to run away.' }, true);
      }
   },
   
   _runCallback: {
      value: function(param) {
         'use strict';
         delete this._fightDelay;
         var temp = gtp.Utils.randomInt(2);
         var success = temp === 1;
         if (success) {
            this._commandExecuting = false;
            this._backToRoaming();
         }
         else {
            this._commandExecuting = false;
            this._commandBubble.reset();
            this._commandBubble.init();
            this._textBubble.addToConversation({ text: 'Couldn\'t run!' });
         }
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
         
         if (this._dead && this._textBubble.isDone()) {
            game.setState(new dw.DeadState(this));
            return;
         }
         
         this._statBubble.update(delta);
         this._commandBubble.update(delta);
         
         this.handleDefaultKeys();
         
         if (this._enemiesDead && this._textBubble.isDone()) {
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
         else if (this._enemyAttackDelay) {
            this._enemyAttackDelay.update(delta);
         }
         else if (this._enemyAttackShakeDelay) {
            this._enemyAttackShakeDelay.update(delta);
            if (!this._shakeMillisCount) {
               this._shakeMillisCount = 0;
            }
            this._shakeMillisCount += delta;
            this._shakeXOffs = (this._shakeMillisCount % 100) > 50 ? 4 : -4;
            console.log(delta);
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

dw.BattleState.prototype.constructor = dw.BattleState;