import { _BaseState } from './_BaseState';
import DwGame from './DwGame';
import Sounds from './Sounds';
import RoamingState from './RoamingState';
import { Delay, Image, Utils } from 'gtp';
import DeadState from './DeadState';
import StatBubble from './StatBubble';
import Enemy from './Enemy';
import BattleCommandBubble from './BattleCommandBubble';
import TextBubble from './TextBubble';
import Conversation from './Conversation';

export default class BattleState extends _BaseState {

   private readonly _enemyName: string;
   private _commandExecuting: boolean;
   private _fightDelay: Delay;
   private _textBubble: TextBubble;
   private _commandBubble: BattleCommandBubble;
   private _statBubble: StatBubble;
   private _enemyFlashDelay: Delay;
   private _enemy: Enemy;
   private _flashMillis: number;
   private _enemiesDead: boolean;
   private _enemyAttackDelay: Delay;
   private _shake: boolean;
   private _enemyAttackShakeDelay: Delay;
   private _shakeXOffs: number;
   private _shakeMillisCount: number;
   private _dead: boolean;

   constructor(enemyName: string) {
      super();
      this._enemyName = enemyName;
   }

   private _backToRoaming() {
      this.game.audio.fadeOutMusic(Sounds.MUSIC_OVERWORLD);
      this.game.setState(new RoamingState());
   }

   fight() {
      this._commandExecuting = true;
      this._fightDelay = new Delay({ millis: [300], callback: this._fightCallback.bind(this) });
      this._textBubble.addToConversation({text: 'You attack!', sound: 'attack'}, true);
   }

   private _fightCallback() {
      this.game.audio.playSound('hit');
      delete this._fightDelay;
      this._enemyFlashDelay = new Delay({ millis: 400, callback: this._enemyFlashCallback.bind(this) });
      this._flashMillis = 0;
   }

   private _enemyFlashCallback() {

      delete this._enemyFlashDelay;
      const game: DwGame = this.game as DwGame;

      const damage: number = game.hero.computePhysicalAttackDamage(this._enemy);
      const dead: boolean = this._enemy.takeDamage(damage);

      const text: string = 'Direct hit! Thy enemy\'s hit points have been reduced by ' + damage + '.';
      this._textBubble.addToConversation({text: text}, true);

      if (dead) {
         this._defeatedEnemy();
      } else {
         this._enemyAttack();
      }
   }

   private _defeatedEnemy() {

      const text: string = '\nThou hast defeated the ' + this._enemy.name + '.' +
          '\nThy experience increases by ' + this._enemy.xp + '.' +
          '\nThy gold increases by ' + this._enemy.gp + '.';
      this._enemiesDead = true;

      const game: DwGame = this.game as DwGame;
      game.hero.exp += this._enemy.xp;
      game.party.gold += this._enemy.gp;

      // TODO: Check for level up

      this._textBubble.addToConversation({text: text, music: 'victory'});
      this._commandExecuting = false;
   }

   _enemyAttack() {
      console.log('_enemyAttack called');
      const text: string = 'The ' + this._enemy.name + ' attacks!';
      this._textBubble.addToConversation({text: text, sound: 'prepareToAttack'}, true);
      this._textBubble.onDone(() => {
         this._enemyAttackDelay = new Delay({
            millis: 200,
            callback: this._enemyAttackCallback.bind(this)
         });
      });
   }

   _enemyAttackCallback() {
      delete this._enemyAttackDelay;
      this._shake = true;
      this.game.audio.playSound('receiveDamage');
      this._enemyAttackShakeDelay = new Delay({
         millis: 1000,
         callback: this._enemyAttackShakeCallback.bind(this)
      });

   }

   _enemyAttackShakeCallback() {

      delete this._enemyAttackShakeDelay;
      this._shake = false;

      const game: DwGame = this.game as DwGame;

      const damage: number = this._enemy.ai(game.hero, this._enemy).damage;
      game.hero.takeDamage(damage);
      let text: string = 'Thy hit points are reduced by ' + damage + '.';
      if (game.hero.isDead()) {
         text += '\nThou art dead.';
         this._textBubble.addToConversation({text: text}, true);
         this._dead = true;
      } else {
         text += '\nCommand?';
         this._textBubble.addToConversation({text: text}, true);
      }

      this._commandExecuting = false;
   }

   enter(game: DwGame) {

      super.enter(game); // Not defined in super, but in parent of super (?)
      this._commandBubble = new BattleCommandBubble(game);
      this._commandExecuting = false;
      this._textBubble = new TextBubble(game);
      const conversation: Conversation = new Conversation();
      this._enemy = new Enemy(game.getEnemy(this._enemyName)).prepare();
      conversation.addSegment({text: 'A ' + this._enemy.name + ' draws near!  Command?'});
      this._textBubble.setConversation(conversation);
      this._statBubble = new StatBubble(game);
   }

   item() {
      this._textBubble.addToConversation({text: 'Not implemented, command?'});
   }

   render(ctx: CanvasRenderingContext2D) {

      const game: DwGame = this.game as DwGame;

      if (this._shake) {
         game.setCameraOffset(this._shakeXOffs, 0);
      }
      game.drawMap(ctx);
      if (this._shake) {
         game.setCameraOffset(0, 0);
      }

      const width: number = game.getWidth();
      const height: number = game.getHeight();
      const tileSize: number = game.getTileSize();

      const battleBG: Image = game.assets.get('battleBG');
      let x: number = (width - battleBG.width) / 2;
      let y: number = (height - battleBG.height) / 2 - tileSize;
      battleBG.draw(ctx, x, y);

      if (this._enemy && !this._enemiesDead) {

         const flash: boolean = Math.round(this._flashMillis) % 40 > 20;
         const enemyImg: Image = this._enemy.getImage(flash);
         x = (width - enemyImg.width) / 2;
         y += battleBG.height - tileSize / 2 - enemyImg.height;
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

      } else if (this._enemiesDead) {
         if (this._statBubble) {
            this._statBubble.paint(ctx);
         }
         if (this._textBubble) {
            this._textBubble.paint(ctx);
         }
      }

   }

   run() {

      const game: DwGame = this.game as DwGame;

      this._commandExecuting = true;
      this._fightDelay = new Delay({ millis: [600], callback: this._runCallback.bind(this) });
      game.audio.playSound('run');
      this._textBubble.addToConversation({text: game.hero.name + ' started to run away.'}, true);
   }

   private _runCallback() {
      delete this._fightDelay;
      const temp: number = Utils.randomInt(2);
      const success: boolean = temp === 1;
      if (success) {
         this._commandExecuting = false;
         this._backToRoaming();
      } else {
         this._commandExecuting = false;
         this._commandBubble.reset();
         this._commandBubble.init();
         this._textBubble.addToConversation({text: 'Couldn\'t run!'});
      }
   }

   update(delta: number) {

      const game: DwGame = this.game as DwGame;

      if (this._dead && this._textBubble.isDone()) {
         game.setState(new DeadState(game, this));
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
      } else if (this._enemyAttackDelay) {
         this._enemyAttackDelay.update(delta);
      } else if (this._enemyAttackShakeDelay) {
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
      } else if (!this._commandExecuting && this._commandBubble.handleInput()) {
         this._commandBubble.handleCommandChosen(this);
      }

   }
}
