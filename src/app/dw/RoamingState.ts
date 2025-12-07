import { Delay, InputManager, Keys, TiledLayerData } from 'gtp';
import { BaseState } from './BaseState';
import { DwGame } from './DwGame';
import { CommandBubble } from './CommandBubble';
import { StatBubble } from './StatBubble';
import { TextBubble } from './TextBubble';
import { Conversation } from './Conversation';
import { StatusBubble } from './StatusBubble';
import { ItemBubble } from './ItemBubble';
import { Item } from './Item';
import { Npc } from './Npc';
import { Hero } from './Hero';
import { MapLogic } from './mapLogic/MapLogic';
import { Cheats } from './Cheats';
import { Direction } from './Direction';
import { ChoiceBubble } from './ChoiceBubble';
import { Door } from './Door';
import { DwMap } from './DwMap';
import { Chest } from './Chest';
import { toLocationString, LocationString, toRowAndColumn } from './LocationString';
import { getChestConversation } from './ChestConversations';

type RoamingSubState = 'ROAMING' | 'MENU' | 'TALKING' | 'OVERNIGHT' | 'WARP_SELECTION';

type UpdateFunction = (delta: number) => void;

export class RoamingState extends BaseState {

    private readonly commandBubble: CommandBubble;
    private readonly statBubble: StatBubble;
    private statusBubble?: StatusBubble;
    private itemBubble?: ItemBubble;
    private warpBubble?: ChoiceBubble<string>;
    private readonly stationaryTimer: Delay;
    private overnightDelay?: Delay;
    private readonly updateMethods: Map<RoamingSubState, UpdateFunction>;
    private readonly textBubble: TextBubble;
    private showTextBubble: boolean;
    private substate: RoamingSubState;
    private showStats: boolean;

    private static readonly OVERNIGHT_DARK_TIME: number = 2500;

    private static readonly OVERNIGHT_FADE_TIME: number = 500;

    private static totalTime = 0;

    constructor(game: DwGame) {

        super(game);

        this.commandBubble = new CommandBubble(game);
        this.statBubble = new StatBubble(this.game);
        this.stationaryTimer = new Delay({ millis: 1000 });

        this.updateMethods = new Map<RoamingSubState, UpdateFunction>();
        this.updateMethods.set('ROAMING', this.updateRoaming.bind(this));
        this.updateMethods.set('MENU', this.updateMenu.bind(this));
        this.updateMethods.set('TALKING', this.updateTalking.bind(this));
        this.updateMethods.set('OVERNIGHT', this.updateOvernight.bind(this));
        this.updateMethods.set('WARP_SELECTION', this.updateWarpSelection.bind(this));

        this.textBubble = new TextBubble(this.game);
        this.showTextBubble = false;
        this.substate = 'ROAMING'; // Can't call setState to appease tsc
        this.showStats = false;
    }

    search() {

        const messages: string[] = [ '\\w{hero.name} searched the ground all about.' ];

        const heroPos: LocationString = toLocationString(this.game.hero.mapRow, this.game.hero.mapCol);
        const chest: boolean = this.game.getMap().chests.has(heroPos);

        // In this game, you must "TAKE" treasure, not "SEARCH" for it.
        if (chest) {
            messages.push('There is a treasure box.');
        } else {
            messages.push('But there found nothing.');
        }

        this.showOneLineConversation(false, ...messages);
    }

    take() {

        const location: LocationString = toLocationString(this.game.hero.mapRow, this.game.hero.mapCol);
        const chest: Chest | undefined = this.game.getMap().chests.get(location);

        this.showTextBubble = true;
        this.textBubble.setConversation(getChestConversation(this, chest));
        this.setSubstate('TALKING');
    }

    takeStairs() {
        if (this.game.hero.possiblyHandleIntersectedObject()) {
            this.setSubstate('ROAMING');
        } else {
            this.showOneLineConversation(true, 'There are no stairs here.');
        }
    }

    override update(delta: number) {

        const game: DwGame = this.game;

        this.handleDefaultKeys();
        if (game.inputManager.isKeyDown(Keys.KEY_R, true)) {
            game.startRandomEncounter();
            return;
        } else if (game.inputManager.isKeyDown(Keys.KEY_O, true)) {
            this.setSubstate('OVERNIGHT');
        }

        game.hero.update(delta);

        RoamingState.totalTime += delta;
        if (RoamingState.totalTime >= 1000) {
            RoamingState.totalTime = 0;
        }

      this.updateMethods.get(this.substate)!.call(this, delta);
    }

    private updateMenu(delta: number) {

        if (this.statBubble) {
            this.statBubble.update(delta);
        }

        if (this.statusBubble) {
            this.statusBubble.update(delta);
            if (this.game.anyKeyDown()) {
                delete this.statusBubble;
                return;
            }
        }

        let done: boolean;
        if (this.itemBubble) {
            this.itemBubble.update(delta);
            done = this.itemBubble.handleInput();
            if (done) {
                const selectedItem: Item | undefined = this.itemBubble.getSelectedItem();
                const success: boolean = !selectedItem || selectedItem.use(this.game); // Either canceled the dialog or selected item
                if (success) {
                    this.itemBubble.removeSelectedItem();
                    this.setSubstate('ROAMING');
                }
                delete this.itemBubble;
            }
            return;
        }

        this.commandBubble.update(delta);
        done = this.commandBubble.handleInput();
        if (done) {
            this.commandBubble.handleCommandChosen(this);
            return;
        }
    }

    private updateRoaming(delta: number) {

        if (this.showStats) {
            this.statBubble.update(delta);
        }

        const hero: Hero = this.game.hero;
        const im: InputManager = this.game.inputManager;

        if (this.game.actionKeyPressed()) {
            this.game.setNpcsPaused(true);
            this.commandBubble.reset();
            this.game.audio.playSound('menu');
            this.setSubstate('MENU');
            this.showStats = true;
            return;
        }

        // Make sure we're not in BattleTransitionState
        if (!hero.isMoving() && this.game.state === this) {

            if (im.up()) {
                hero.tryToMoveUp();
                this.stationaryTimer.reset();
                this.statBubble.init();
            //this.yOffs = Math.max(this.yOffs-inc, 0);
            } else if (im.down()) {
                hero.tryToMoveDown();
                this.stationaryTimer.reset();
                this.statBubble.init();
            //this.yOffs = Math.min(this.yOffs+inc, maxY);
            } else if (im.left()) {
                hero.tryToMoveLeft();
                this.stationaryTimer.reset();
                this.statBubble.init();
            //this.xOffs = Math.max(this.xOffs-inc, 0);
            } else if (im.right()) {
                hero.tryToMoveRight();
                this.stationaryTimer.reset();
                this.statBubble.init();
            //this.xOffs = Math.min(this.xOffs+inc, maxX);
            }

        }

        this.showStats = this.stationaryTimer.update(delta);

        if (im.isKeyDown(Keys.KEY_SHIFT)) {
            if (im.isKeyDown(Keys.KEY_C, true)) {
                this.game.toggleShowCollisionLayer();
            }
            if (im.isKeyDown(Keys.KEY_T, true)) {
                this.game.toggleShowTerritoryLayer();
            }
        }

        this.game.getMap().npcs.forEach((npc: Npc) => {
            npc.update(delta);
        });

    }

    private updateTalking(delta: number) {

        const done: boolean = this.textBubble.handleInput();
        if (/*this._textBubble.currentTextDone() && */this.textBubble.isOvernight()) {
            this.setSubstate('OVERNIGHT');
            this.textBubble.clearOvernight();
        } else if (this.showTextBubble) {
            this.textBubble.update(delta);
        }

        if (done) {
            this.startRoaming();
            return;
        }
    }

    private updateOvernight(delta: number) {

        if (this.overnightDelay) {
            this.overnightDelay.update(delta);
        } else {
            this.game.audio.playMusic('overnight', false);
            this.overnightDelay = new Delay({
                millis: [ RoamingState.OVERNIGHT_DARK_TIME ],
                callback: this.overnightOver.bind(this),
            });
        }
    }

    private updateWarpSelection(delta: number) {

        // Do check here to appease tsc of warpBubble being defined
        this.warpBubble ??= Cheats.createWarpBubble(this.game);

        this.warpBubble.update(delta);
        if (this.warpBubble.handleInput()) {
            const warpTo: string | undefined = this.warpBubble.getSelectedItem();
            this.warpBubble = undefined;
            if (warpTo) {
                this.warpTo(warpTo); // TODO: Make me cleaner
                this.setSubstate('ROAMING');
            } else {
                this.setSubstate('MENU');
            }
            this.warpBubble = undefined;
        }
    }

    private overnightOver() {
        this.game.audio.playMusic('MUSIC_TOWN');
        delete this.overnightDelay;
        this.setSubstate('TALKING');
        //         this._textBubble.nudgeConversation(); // User doesn't have to press a key
    }

    openDoor(): boolean {


        const door: Door | undefined = this.game.getDoorHeroIsFacing();

        if (door) {

            const game: DwGame = this.game;
            if (!game.party.getInventory().remove('Magic Key')) {
                this.showOneLineConversation(false, 'You do not have a key!'); // TODO: Verify text
                return false;
            }

            this.game.audio.playSound('door');
            const map: DwMap = this.game.getMap();
            map.getLayer('tileLayer').setData(door.row, door.col, door.replacementTileIndex);
            const index: number = map.doors.indexOf(door);
            if (index > -1) {
                map.doors.splice(index, 1);
                map.getLayer('collisionLayer').setData(door.row, door.col, 0);
            } else { // Should never happen
                console.error(`Door not found in map.doors! - ${door.toString()}`);
            }
            this.setSubstate('ROAMING');
            return true;
        }

        this.showOneLineConversation(false, 'There is no door here.');
        return false;
    }

    private possiblyRenderNpc(npc: Npc, ctx: CanvasRenderingContext2D) {

        const row: number = npc.mapRow;
        const col: number = npc.mapCol;
        const underRoof: boolean = this.game.hasRoofTile(row, col);
        if (underRoof && this.game.inside || !underRoof && !this.game.inside) {
            npc.render(ctx);
        }
    }

    override render(ctx: CanvasRenderingContext2D) {

        if (this.game.getMap().propertiesByName.get('requiresTorch')) {
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

        // TODO: Be more efficient here
        this.game.getMap().chests.forEach((chest: Chest) => {

            const { row, col } = toRowAndColumn(chest.location);

            let x: number = col * this.game.getTileSize();
            x -= this.game.getMapXOffs();
            let y: number = row * this.game.getTileSize();
            y -= this.game.getMapYOffs();
            this.game.getMap().drawTile(ctx, x, y, 5, {} as TiledLayerData);
        });

        this.game.hero.render(ctx);

        this.game.getMap().npcs.forEach((npc: Npc) => {
            this.possiblyRenderNpc(npc, ctx);
        });

        if (this.game.getMap().propertiesByName.get('requiresTorch')) {
            ctx.restore();
        }

        if (this.substate === 'MENU' || this.substate === 'WARP_SELECTION') {
            this.commandBubble.paint(ctx);
        }

        if (this.showTextBubble) {
            this.textBubble.paint(ctx);
        }

        if (this.substate !== 'ROAMING' || this.showStats) {
            this.statBubble.paint(ctx);
        }
        if (this.statusBubble) {
            this.statusBubble.paint(ctx);
        }
        if (this.itemBubble) {
            this.itemBubble.paint(ctx);
        }
        if (this.warpBubble) {
            this.warpBubble.paint(ctx);
        }

        if (this.overnightDelay) {
            ctx.save();
            const overnightRemaining: number = this.overnightDelay.getRemaining();
            let alpha: number;
            const fadeInTime: number = RoamingState.OVERNIGHT_FADE_TIME;
            if (overnightRemaining > RoamingState.OVERNIGHT_DARK_TIME - fadeInTime) {
                alpha = (RoamingState.OVERNIGHT_DARK_TIME - overnightRemaining) / fadeInTime;
                ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            } else if (overnightRemaining < fadeInTime) {
                alpha = overnightRemaining / fadeInTime;
                ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            }
            ctx.fillRect(0, 0, this.game.getWidth(), this.game.getHeight());
            ctx.restore();
        }
    }

    private setSubstate(substate: RoamingSubState) {
        const prevSubstate: RoamingSubState = this.substate;
        this.substate = substate;
        if (substate === 'MENU') {
            this.commandBubble.init();
        } else if (substate === 'TALKING' &&
          prevSubstate !== 'OVERNIGHT') {
            this.textBubble.init();
        }
    }

    showInventory() {
        this.itemBubble = new ItemBubble(this.game);
    }

    private showNoSpellsMessage() {
        this.showOneLineConversation(false, 'You have not learned any spells yet!');
    }

    /**
     * Displays one or more static lines of text in the conversation bubble.
     *
     * @param voice Whether to play the "talking" sound effect.
     * @param text The text to display.
     */
    showOneLineConversation(voice: boolean, ...text: string[]) {

        const conversation: Conversation = new Conversation(this.game, voice);
        text.forEach((line) => {
            conversation.addSegment(line);
        });
        this.showTextBubble = true;
        this.textBubble.setConversation(conversation);
        this.setSubstate('TALKING');
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
        this.statusBubble = new StatusBubble(this.game);
    }

    showWarpBubble() {
        this.setSubstate('WARP_SELECTION');
    }

    startRoaming() {
        this.game.setNpcsPaused(false);
        this.showTextBubble = false;
        this.setSubstate('ROAMING');
    }

    talkToNpc() {

        const logic: MapLogic | undefined = this.game.getMapLogic();
        if (!logic) {
            console.log('Error: No map logic found for this map!  Cannot talk to NPCs!');
            return;
        }

        const npc: Npc | undefined = this.game.getNpcHeroIsFacing();
        const conversation: Conversation = new Conversation(this.game, true);

        if (npc) {
            const hero: Hero = this.game.hero;
            //var newNpcDir = this.getHero().direction.opposite();
            const newNpcDir: number = (hero.direction + 2) % 4;
            npc.direction = newNpcDir;
            conversation.setSegments(logic.npcText(npc, this.game));
        } else {
            conversation.addSegment('There is no one there.');
        }
        this.showTextBubble = true;
        this.textBubble.setConversation(conversation);
        this.setSubstate('TALKING');
    }

    warpTo(location: string) {

        this.setSubstate('ROAMING');

        switch (location) {
            case 'Brecconary':
                Cheats.warpTo(this.game, 'brecconary', 15, 2, 'Brecconary', Direction.EAST);
                break;
            case 'Tantegel (1st floor)':
                Cheats.warpTo(this.game, 'tantegelCastle', 15, 7, 'Tantegel Castle', Direction.WEST);
                break;
            case 'Tantegel (throne room)':
                Cheats.warpTo(this.game, 'tantegelCastleUpstairs', 11, 10, 'the King at Tantegel Castle', Direction.WEST);
                break;
            case 'Garinham':
                Cheats.warpTo(this.game, 'garinham', 14, 1, 'Garinham');
                break;
            case 'Erdrick\'s Cave':
                Cheats.warpTo(this.game, 'erdricksCave1', 1, 1, 'Erdrick\'s Cave');
                break;
            case 'Far Reaches':
                Cheats.warpTo(this.game, 'overworld', 46, 85, 'Overworld');
        }
    }
}
