import { _BaseState } from './_BaseState';
import { Delay, InputManager, Keys } from 'gtp';
import DwGame from './DwGame';
import Sounds from './Sounds';
import CommandBubble from './CommandBubble';
import StatBubble from './StatBubble';
import TextBubble from './TextBubble';
import Conversation from './Conversation';
import StatusBubble from './StatusBubble';
import ItemBubble from './ItemBubble';
import Item from './Item';
import Npc from './Npc';
import Hero from './Hero';
import MapLogic from './MapLogic';

const _RoamingSubState: any = Object.freeze({
   ROAMING: 0,
   MENU: 1,
   TALKING: 2,
   OVERNIGHT: 3
});

export default class RoamingState extends _BaseState {

   private readonly _commandBubble: CommandBubble;
   private readonly _statBubble: StatBubble;
   private _statusBubble: StatusBubble;
   private _itemBubble: ItemBubble;
   private readonly _stationaryTimer: Delay;
   private _overnightDelay: Delay;
   private readonly _updateMethods: any;
   private readonly _textBubble: TextBubble;
   private _showTextBubble: boolean;
   private _substate: number;
   private _showStats: boolean;

   private static readonly _OVERNIGHT_DARK_TIME: number = 2500;

   private static readonly _OVERNIGHT_FADE_TIME: number = 500;

   private static _totalTime: number = 0;

   constructor(args?: any) {

      super(args);

      this._commandBubble = new CommandBubble();
      this._statBubble = new StatBubble(this.game);
      this._stationaryTimer = new Delay({millis: 1000});

      this._setSubstate(_RoamingSubState.ROAMING);

      this._updateMethods = {};
      this._updateMethods[_RoamingSubState.ROAMING] = this.updateRoaming;
      this._updateMethods[_RoamingSubState.MENU] = this.updateMenu;
      this._updateMethods[_RoamingSubState.TALKING] = this.updateTalking;
      this._updateMethods[_RoamingSubState.OVERNIGHT] = this.updateOvernight;

      this._textBubble = new TextBubble(this.game);
      this._showTextBubble = false;
   }

   search() {
       this.showOneLineConversation('\\w{hero.name} searched the ground all about.', 'But there found nothing.');
   }

   takeStairs() {
       this.showOneLineConversation('There are no stairs here.');
   }

   update(delta: number) {

      const game: DwGame = this.game;

      this.handleDefaultKeys();
      if (game.inputManager.isKeyDown(Keys.KEY_R, true)) {
         game.startRandomEncounter();
         return;
      } else if (game.inputManager.isKeyDown(Keys.KEY_O, true)) {
         this._setSubstate(_RoamingSubState.OVERNIGHT);
      }

      game.hero.update(delta);

      RoamingState._totalTime += delta;
      if (RoamingState._totalTime >= 1000) {
         RoamingState._totalTime = 0;
      }

      this._updateMethods[this._substate].call(this, delta);
   }

   private updateMenu(delta: number) {

      if (this._statusBubble) {
         this._statusBubble.update(delta);
         if (this.game.anyKeyDown()) {
            delete this._statusBubble;
            return;
         }
      }

      let done: boolean;
      if (this._itemBubble) {
         this._itemBubble.update(delta);
         done = this._itemBubble.handleInput();
         if (done) {
            const selectedItem: Item | null = this._itemBubble.getAndRemoveSelectedItem()!;
            delete this._itemBubble;
            const success: boolean = !selectedItem || selectedItem.use(); // Either canceled the dialog or selected item
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

   private updateRoaming(delta: number) {

      if (this._substate !== _RoamingSubState.ROAMING || this._showStats) {
         this._statBubble.update(delta);
      }

      const hero: Hero = this.game.hero;
      const im: InputManager = this.game.inputManager;

      if (this.game.actionKeyPressed()) {
         this.game.setNpcsPaused(true);
         this._commandBubble.reset();
         this.game.audio.playSound('menu');
         this._setSubstate(_RoamingSubState.MENU);
         return;
      }

      // Make sure we're not in BattleTransitionState
      if (!hero.isMoving() && this.game.state === this) {

         if (im.up()) {
            hero.tryToMoveUp();
            this._stationaryTimer.reset();
            this._statBubble.init();
            //this.yOffs = Math.max(this.yOffs-inc, 0);
         } else if (im.down()) {
            hero.tryToMoveDown();
            this._stationaryTimer.reset();
            this._statBubble.init();
            //this.yOffs = Math.min(this.yOffs+inc, maxY);
         } else if (im.left()) {
            hero.tryToMoveLeft();
            this._stationaryTimer.reset();
            this._statBubble.init();
            //this.xOffs = Math.max(this.xOffs-inc, 0);
         } else if (im.right()) {
            hero.tryToMoveRight();
            this._stationaryTimer.reset();
            this._statBubble.init();
            //this.xOffs = Math.min(this.xOffs+inc, maxX);
         }

      }

      this._showStats = this._stationaryTimer.update(delta);

      if (im.isKeyDown(Keys.KEY_SHIFT)) {
         if (im.isKeyDown(Keys.KEY_C, true)) {
            this.game.toggleShowCollisionLayer();
         }
         if (im.isKeyDown(Keys.KEY_T, true)) {
            this.game.toggleShowTerritoryLayer();
         }
         if (im.isKeyDown(Keys.KEY_S, true)) {
            this.game.audio.playSound('stairs');
         }
      }

      this.game.map.npcs.forEach((npc: Npc) => {
         npc.update(delta);
      });

   }

   private updateTalking(delta: number) {

      const done: boolean = this._textBubble.handleInput();
      if (/*this._textBubble.currentTextDone() && */this._textBubble.isOvernight()) {
         this._setSubstate(_RoamingSubState.OVERNIGHT);
         this._textBubble.clearOvernight();
      } else if (this._showTextBubble) {
         this._textBubble.update(delta);
      }

      if (done) {
         this.startRoaming();
         return;
      }
   }

   private updateOvernight(delta: number) {

      if (this._overnightDelay) {
         this._overnightDelay.update(delta);
      } else {
         this.game.audio.playMusic('overnight', false);
         this._overnightDelay = new Delay({
            millis: [RoamingState._OVERNIGHT_DARK_TIME],
            callback: this.overnightOver.bind(this)
         });
      }
   }

   private overnightOver() {
      this.game.audio.playMusic(Sounds.MUSIC_TOWN);
      delete this._overnightDelay;
      this._setSubstate(_RoamingSubState.TALKING);
//         this._textBubble.nudgeConversation(); // User doesn't have to press a key
   }

   openDoor() {

      if (!this.game.openDoorHeroIsFacing()) {
         this.showOneLineConversation('There is no door there to open!');
      } else {
         this._setSubstate(_RoamingSubState.ROAMING);
      }
   }

   private possiblyRenderNpc(npc: Npc, ctx: CanvasRenderingContext2D) {

      const row: number = npc.mapRow;
      const col: number = npc.mapCol;
      const underRoof: boolean = this.game.hasRoofTile(row, col);
      if ((underRoof && this.game.inside) || (!underRoof && !this.game.inside)) {
         npc.render(ctx);
      }
   }

   render(ctx: CanvasRenderingContext2D) {

      if (this.game.map.propertiesByName.requiresTorch) {
         this.game.clearScreen('#000000');
         ctx.save();
         const clipRadius: number = this.game.getUsingTorch() ? this.game.getTileSize() * 3 / 2 :
             this.game.getTileSize() / 2;
         const x0: number = this.game.getWidth() / 2 - clipRadius;
         const y0: number = this.game.getHeight() / 2 - clipRadius;
         ctx.beginPath();
         ctx.rect(x0, y0, 2 * clipRadius, 2 * clipRadius);
         ctx.clip();
      } else if (this.game.inside) {
         this.game.clearScreen('#000000');
      }

      this.game.drawMap(ctx);
      this.game.hero.render(ctx);

      this.game.map.npcs.forEach((npc: Npc) => {
         this.possiblyRenderNpc(npc, ctx);
      });

      if (this.game.map.propertiesByName.requiresTorch) {
         ctx.restore();
      }

      if (this._substate === _RoamingSubState.MENU) {
         this._commandBubble.paint(ctx);
      }

      if (this._showTextBubble) {
         this._textBubble.paint(ctx);
      }

      if (this._substate !== _RoamingSubState.ROAMING || this._showStats) {
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
         const overnightRemaining: number = this._overnightDelay.getRemaining();
         let alpha: number;
         const fadeInTime: number = RoamingState._OVERNIGHT_FADE_TIME;
         if (overnightRemaining > (RoamingState._OVERNIGHT_DARK_TIME - fadeInTime)) {
            alpha = (RoamingState._OVERNIGHT_DARK_TIME - overnightRemaining) / fadeInTime;
            ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
         } else if (overnightRemaining < fadeInTime) {
            alpha = overnightRemaining / fadeInTime;
            ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
         } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
         }
         ctx.fillRect(0, 0, this.game.getWidth(), this.game.getHeight());
         ctx.restore();
      }
   }

   _setSubstate(substate: number) {
      const prevSubstate: number = this._substate;
      this._substate = substate;
      this._statBubble.init(); // Reset this guy
      if (substate === _RoamingSubState.MENU) {
         this._commandBubble.init();
      } else if (substate === _RoamingSubState.TALKING &&
          prevSubstate !== _RoamingSubState.OVERNIGHT) {
         this._textBubble.init();
      }
   }

   showInventory() {
      this._itemBubble = new ItemBubble();
   }

   private showNoSpellsMessage() {
       this.showOneLineConversation('You have not learned any spells yet!');
   }

    /**
     * Displays one or more static lines of text in the conversation bubble.
     *
     * @param text The text to display.
     */
   private showOneLineConversation(...text: string[]) {

       const conversation: Conversation = new Conversation();
       for (let i: number = 0; i < text.length; i++) {
           conversation.addSegment(text[i]);
       }
       this._showTextBubble = true;
       this._textBubble.setConversation(conversation);
       this._setSubstate(_RoamingSubState.TALKING);
   }

   showSpellList() {

       const hero: Hero = this.game.hero;

       if (!hero.spells.length) {
           this.showNoSpellsMessage();
           return;
       }

       // TODO: Show spells bubble
   }

   showStatus() {
      this._statusBubble = new StatusBubble(this.game);
   }

   startRoaming() {
      this.game.setNpcsPaused(false);
      this._showTextBubble = false;
      this._setSubstate(_RoamingSubState.ROAMING);
      this._stationaryTimer.reset();
   }

   talkToNpc() {

      const logic: MapLogic | null = this.game.getMapLogic();
      if (!logic) {
         console.log('Error: No map logic found for this map!  Cannot talk to NPCs!');
         return;
      }

      const conversation: Conversation = new Conversation();

      const npc: Npc | null = this.game.getNpcHeroIsFacing();
      if (npc) {
         const hero: Hero = this.game.hero;
         //var newNpcDir = this.getHero().direction.opposite();
         const newNpcDir: number = (hero.direction + 2) % 4;
         npc.direction = newNpcDir;
         conversation.setSegments(logic.npcText(npc));
      } else {
         conversation.addSegment('There is nobody in that direction!');
      }
      this._showTextBubble = true;
      this._textBubble.setConversation(conversation);
      this._setSubstate(_RoamingSubState.TALKING);
   }
}
