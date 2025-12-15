import {
    BitmapFont,
    FadeOutInState,
    Game,
    GameArgs,
    getProperty,
    InputManager,
    Keys,
    TiledImagePathModifier,
    TiledLayer,
    TiledMapData,
    TiledObject,
    Utils,
} from 'gtp';
import { Hero } from './Hero';
import { Shield } from './Shield';
import { Npc } from './Npc';
import { Armor } from './Armor';
import { Weapon } from './Weapon';
import { Direction } from './Direction';
import { NpcType, getNpcType } from './NpcType';
import { Door } from './Door';
import { Party } from './Party';
import { MapChangeState } from './MapChangeState';
import { RoamingState } from './RoamingState';
import { DwMap } from './DwMap';
import { BattleState } from './BattleState';
import { BattleTransitionState } from './BattleTransitionState';

import { Brecconary } from './mapLogic/brecconary';
import { ErdricksCave1 } from './mapLogic/erdricksCave1';
import { ErdricksCave2 } from './mapLogic/erdricksCave2';
import { Garinham } from './mapLogic/garinham';
import { Overworld } from './mapLogic/overworld';
import { TantegelCastle } from './mapLogic/tantegelCastle';
import { MapLogic } from './mapLogic/MapLogic';
import { EquipmentMap } from './dw';
import { createDefaultGameState } from './DwGameState';
import { Chest, ChestContentType } from './Chest';
import { toLocationString, LocationString } from './LocationString';
import { BaseState } from './BaseState';
import { EnemyData } from './Enemy';
import { RoamingEntityRange } from './RoamingEntity';
import { HERB, Item } from '@/app/dw/Item';
import { HiddenItem, HiddenItemType } from '@/app/dw/HiddenItem';

export type TiledMapMap = Record<string, DwMap>;

export class DwGame extends Game {

    private map?: DwMap;
    readonly maps: TiledMapMap = {};
    hero: Hero;
    party: Party;
    npcs: Npc[] = [];
    private readonly gameState = createDefaultGameState();
    private bumpSoundDelay = 0;
    private readonly mapLogics = new Map<string, MapLogic>();
    private randomEncounters = true;
    private torch = false;
    inside = false;
    npcsPaused = false;
    private cameraDx = 0;
    private cameraDy = 0;

    constructor(args: GameArgs) {
        super(args);

        // Create and initialize party
        this.hero = new Hero(this, { name: 'Erdrick' });
        this.party = new Party(this);
        this.party.addMember(this.hero);
    }

    override start() {
        super.start();

        this.npcs = [];
        this.bumpSoundDelay = 0;
        this.setCameraOffset(0, 0);
        this.inside = false;
        this.randomEncounters = true;
        this.torch = false;

        this.mapLogics.set('Brecconary', new Brecconary());
        this.mapLogics.set('erdricksCave1', new ErdricksCave1());
        this.mapLogics.set('erdricksCave2', new ErdricksCave2());
        this.mapLogics.set('Garinham', new Garinham());
        this.mapLogics.set('Overworld', new Overworld());
        this.mapLogics.set('TantegelCastle', new TantegelCastle());
    }

    actionKeyPressed() {
        return this.inputManager.isKeyDown(Keys.KEY_Z, true);
    }

    anyKeyDown(clear = true) {
        const im: InputManager = this.inputManager;
        return im.isKeyDown(Keys.KEY_Z, clear) || im.isKeyDown(Keys.KEY_X, clear) ||
            im.enter(clear);
    }

    cancelKeyPressed() {
        return this.inputManager.isKeyDown(Keys.KEY_X, true);
    }

    override update() {
        super.update();
    }

    cycleArmor() {
        if (this.hero?.armor) {
            const curArmor: string = this.hero.armor.name;
            const armorArray: Armor[] = this.assets.get('armorArray');
            let i: number;
            for (i = 0; i < armorArray.length; i++) {
                if (curArmor === armorArray[ i ].name) {
                    break;
                }
            }
            i = (i + 1) % armorArray.length;
            this.hero.armor = armorArray[ i ];
            this.setStatusMessage('Armor changed to: ' + this.hero.armor.name);
        }
    }

    cycleShield() {
        if (this.hero?.shield) {
            const curShield: string = this.hero.shield.name;
            const shieldArray: Shield[] = this.assets.get('shieldArray');
            let i: number;
            for (i = 0; i < shieldArray.length; i++) {
                if (curShield === shieldArray[ i ].name) {
                    break;
                }
            }
            i = (i + 1) % shieldArray.length;
            this.hero.shield = shieldArray[ i ];
            this.setStatusMessage(`Shield changed to: ${this.hero.shield.name}`);
        }
    }

    cycleWeapon() {
        if (this.hero?.weapon) {
            const curWeapon: string = this.hero.weapon.name;
            const weaponArray: Weapon[] = this.assets.get('weaponsArray');
            let i: number;
            for (i = 0; i < weaponArray.length; i++) {
                if (curWeapon === weaponArray[ i ].name) {
                    break;
                }
            }
            i = (i + 1) % weaponArray.length;
            this.hero.weapon = weaponArray[ i ];
            this.setStatusMessage('Weapon changed to: ' + this.hero.weapon.name);
        }
    }

    drawArrow(x: number, y: number) {
        this.drawString('\u007f', x, y); // DEL, but we use for our arrow
    }

    drawDownArrow(x: number, y: number) {
        this.drawString('\\', x, y); // '\' char replaced by down arrow
    }

    drawMap(ctx: CanvasRenderingContext2D) {
        const hero: Hero = this.hero;
        const centerCol: number = hero.mapCol;
        const centerRow: number = hero.mapRow;
        const dx: number = hero.xOffs + this.cameraDx;
        const dy: number = hero.yOffs + this.cameraDy;

        //         if (this._drawMapCount === 10) {
        //            this.timer.start('drawMap');
        //         }
        this.getMap().draw(ctx, centerRow, centerCol, dx, dy);
        //         if (this._drawMapCount === 10) {
        //            this.timer.endAndLog('drawMap');
        //            this._drawMapCount = 0;
        //         }

    }

    drawString(text: string | number, x: number, y: number) {
        const textStr: string = typeof text === 'number' ? text.toString() : text;
        this.getFont().drawString(this.getRenderingContext(), textStr, x, y);
    }

    getEnemy(name: string): EnemyData {
        const enemyDatas: Record<string, EnemyData> = this.assets.get('enemies');
        return enemyDatas[name];
    }

    private getFont(): BitmapFont {
        return this.assets.get('font');
    }

    getMap(): DwMap {
        if (!this.map) { // This is a logic error
            throw new Error('No map loaded!');
        }
        return this.map;
    }

    getMapLogic(): MapLogic | undefined {
        let logicFile: string = this.getMap().getProperty('logicFile');
        logicFile = logicFile.charAt(0).toUpperCase() + logicFile.substring(1);
        console.log(logicFile);
        return this.mapLogics.get(logicFile);
    }

    getMapXOffs(): number {
        const hero: Hero = this.hero;
        const centerCol: number = hero.mapCol;
        const dx: number = hero.xOffs;
        const tileSize: number = this.getTileSize();
        const xOffs: number = centerCol * tileSize + tileSize / 2 + dx - this.getWidth() / 2;
        return xOffs;
    }

    getMapYOffs(): number {
        const hero: Hero = this.hero;
        const centerRow: number = hero.mapRow;
        const dy: number = hero.yOffs;
        const tileSize: number = this.getTileSize();
        const yOffs: number = centerRow * tileSize + tileSize / 2 + dy - this.getHeight() / 2;
        return yOffs;
    }

    getParty(): Party {
        return this.party;
    }

    /**
     * Returns whether the tile at a given location has a "roof" layer tile.
     */
    hasRoofTile(row: number, col: number): boolean {
        const roofLayer: TiledLayer | undefined = this.getMap().getLayerIfExists('tileLayer2');
        return roofLayer ? roofLayer.getData(row, col) > 0 : false;
    }

    /**
     * Starts loading a new map.  Fades out of the old one and into the new one.
     */
    loadMap(mapName: string, newRow: number, newCol: number, dir?: number) {
        this.audio.playSound('stairs');
        const updatePlayer: () => void = () => {
            this.hero.setMapLocation(-1, -1); // Free the location he was in the map
            this.setMap(mapName + '.json');
            this.hero.setMapLocation(newRow, newCol);
            this.hero.direction = dir ?? Direction.SOUTH;
            this.inputManager.clearKeyStates(); // Prevent keydown from being read in the next screen
        };
        this.setState(new /*FadeOutInState*/MapChangeState(this.state as BaseState, this.state as BaseState,
            updatePlayer));
    }

    private resetMap(map: DwMap) {
        map.npcs.forEach((npc) => {
            npc.reset();
        });
    }

    setMap(assetName: string) {
        const prevMap: DwMap | undefined = this.map;
        console.log('Setting map to: ' + assetName);
        this.map = this.maps[ assetName ];
        this.resetMap(this.map);
        if (prevMap && prevMap.getProperty('requiresTorch', false) !==
            this.getMap().getProperty('requiresTorch', false)) {
            // You blow your torch out leaving a dungeon, but it stays lit
            // when going into another map in the same dungeon that is also dark
            this.setUsingTorch(false);
        }
        const newMusic: string | undefined = this.map.getProperty('music');
        if (newMusic !== this.audio.getCurrentMusic()) {
            this.audio.fadeOutMusic(newMusic);
        }
    }

    initLoadedMap(asset: string): DwMap {

        const data: TiledMapData = this.assets.get(asset);
        const imagePathModifier: TiledImagePathModifier = (imagePath: string) => {
            return imagePath.replace('../', 'res/');
        };

        const mapName: string = asset.substring(0, asset.indexOf('.')); // Remove trailing '.json'
        const map: DwMap = new DwMap(mapName, data, {
            imagePathModifier: imagePathModifier,
            screenWidth: this.getWidth(),
            screenHeight: this.getHeight(),
            assets: this.assets,
        });
        map.setScale(this.scale);
        this.adjustGameMap(map);

        this.maps[ asset ] = map;
        return map;
    }

    private adjustGameMap(map: DwMap) {

        // Hide layers that shouldn't be shown. These could be marked as hidden in Tiled, but
        // it's useful to see their data while in the editor.
        for (let i = 0; i < map.getLayerCount(); i++) {
            const layer: TiledLayer = map.getLayerByIndex(i);
            if (layer.name !== 'tileLayer') {
                layer.visible = false;
            }
        }

        map.npcs.length = 0;
        map.doors.length = 0;
        map.talkAcrosses.clear();
        map.chests.clear();
        const npcLayer: TiledLayer | undefined = map.layersByName.get('npcLayer');
        if (npcLayer?.isObjectGroup()) {

            for (const obj of npcLayer.objects) {
                let chest: Chest;
                switch (obj.type) {
                    case 'npc':
                        map.npcs.push(this.parseNpc(obj));
                        break;
                    case 'door':
                        map.doors.push(this.parseDoor(obj));
                        break;
                    case 'talkAcross':
                        map.talkAcrosses.set(this.parseTalkAcrossKey(obj), true);
                        break;
                    case 'chest':
                        chest = this.parseChestContents(obj);
                        map.chests.set(chest.location, chest);
                        break;
                    default:
                        console.error(`Unhandled npcLayer object type in tiled map: ${obj.type}`);
                        break;
                }
            }

            map.removeLayer('npcLayer');

        }

        map.npcs.forEach((npc: Npc) => {
            map.getLayer('collisionLayer').setData(npc.mapRow, npc.mapCol, 1);
        });

        const hiddenItemLayer: TiledLayer | undefined = map.layersByName.get('hiddenItemLayer');
        if (hiddenItemLayer?.isObjectGroup()) {
            for (const obj of hiddenItemLayer.objects) {
                let hiddenItem: HiddenItem;
                switch (obj.type) {
                    case 'item':
                        hiddenItem = this.parseHiddenItem(obj);
                        map.hiddenItems.set(hiddenItem.location, hiddenItem);
                        break;
                    default:
                        console.error(`Unhandled hiddenItem object type in tiled map: ${obj.type}`);
                }
            }
        }

        // Don't need to set collision as it is already set in the map.
        // Should we require that?

        //         // Hide layers we aren't interested in seeing.
        //         map.getLayer('collisionLayer').setVisible(collisionLayerVisible);
        //         Layer layer = map.getLayer('enemyTerritoryLayer');
        //         if (layer!=null) {
        //            layer.setVisible(enemyTerritoryLayerVisible);
        //         }

    }

    private parseChestContents(chest: TiledObject): Chest {

        const id: string = chest.name;
        let value: number;

        const contentType: ChestContentType = getProperty(chest, 'contentType');
        switch (contentType) {
            case 'gold':
                value = getProperty(chest, 'contents');
                break;
            default:
                console.error(`Invalid contentType for chest ${chest.name}: ${contentType}`);
                value = 1;
                break;
        }

        const tileSize: number = this.getTileSize();
        const row: number = chest.y / tileSize;
        const col: number = chest.x / tileSize;

        return {
            id,
            contentType,
            contents: value,
            location: toLocationString(row, col),
        };
    }

    private parseDoor(obj: TiledObject): Door {
        const name: string = obj.name;
        const replacementTileIndex: number =
            parseInt(getProperty(obj, 'replacementTileIndex'), 10);
        const tileSize: number = this.getTileSize();
        const row: number = obj.y / tileSize;
        const col: number = obj.x / tileSize;
        return new Door(name, row, col, replacementTileIndex);
    }

    private parseHiddenItem(hiddenItem: TiledObject): HiddenItem {
        const id: string = hiddenItem.name;
        let value: Item;

        const itemType: string = getProperty(hiddenItem, 'item');
        switch (itemType) {
            case 'herb':
                value = HERB;
                break;
            default:
                console.error(`Invalid itemType for hiddenItem ${hiddenItem.name}: ${itemType}`);
                value = HERB;
                break;
        }

        const tileSize: number = this.getTileSize();
        const row: number = hiddenItem.y / tileSize;
        const col: number = hiddenItem.x / tileSize;

        return {
            id,
            // Must be a string before this to handle typos/bugs in the map file not specifying a valid type
            contentType: itemType as HiddenItemType,
            contents: value,
            location: toLocationString(row, col),
        };
    }

    private parseNpc(obj: TiledObject): Npc {
        const name: string = obj.name;
        let type: NpcType | undefined;
        if (obj.propertiesByName.has('type')) {
            type = getNpcType(getProperty(obj, 'type'));
        }
        const tileSize: number = this.getTileSize();
        const row: number = obj.y / tileSize;
        const col: number = obj.x / tileSize;
        const tempDir: string = getProperty(obj, 'dir', 'SOUTH');
        let dir = Direction.fromString(tempDir); // || Direction.SOUTH;
        if (typeof dir === 'undefined') {
            dir = Direction.SOUTH;
        }
        const wanderStr: string = getProperty(obj, 'wanders', 'true');
        const wanders: boolean = wanderStr === 'true';
        const range = this.parseRange(getProperty(obj, 'range', ''));
        return new Npc(this, {
            name, type, direction: dir,
            range, wanders, mapRow: row, mapCol: col,
        });
    }

    private parseRange(rangeStr?: string): RoamingEntityRange | undefined {
        let range: RoamingEntityRange | undefined;
        if (rangeStr) {
            const temp: string[] = rangeStr.split(/,\s*/);
            if (temp.length !== 4) {
                throw new Error(`Invalid range string: ${rangeStr}`);
            }
            range = {
                minCol: parseInt(temp[0], 10),
                minRow: parseInt(temp[1], 10),
                maxCol: parseInt(temp[2], 10),
                maxRow: parseInt(temp[3], 10),
            };
        }
        return range;
    }

    private parseTalkAcrossKey(obj: TiledObject): LocationString {
        const tileSize: number = this.getTileSize();
        const row: number = obj.y / tileSize;
        const col: number = obj.x / tileSize;
        return toLocationString(row, col);
    }

    private loadGame() {
        const hero: Hero = this.hero;
        hero.hp = hero.maxHp = 15;
        hero.mp = hero.maxMp = 15;
        hero.strength = 4;
        hero.agility = 4;

        const weaponMap: EquipmentMap<Weapon> = this.assets.get('weapons');
        hero.weapon = weaponMap.club;
        const armorMap: EquipmentMap<Armor> = this.assets.get('armor');
        hero.armor = armorMap.clothes;
        const shieldMap: EquipmentMap<Shield> = this.assets.get('shields');
        hero.shield = shieldMap.smallShield;
    }

    setCameraOffset(dx: number, dy: number) {
        this.cameraDx = dx;
        this.cameraDy = dy;
    }

    startNewGame() {
        this.loadGame();
        const transitionLogic: () => void = () => {
            //            this.setMap('overworld.json');
            //            this.hero.setMapLocation(52, 45);
            this.setMap('brecconary.json');
            this.hero.setMapLocation(7, 6);
        };
        this.setState(new FadeOutInState(this.state, new RoamingState(this), transitionLogic));
    }

    setInsideOutside(inside: boolean) {
        this.inside = inside;
        this.getMap().getLayer('tileLayer').visible = !this.inside;
        this.getMap().getLayer('tileLayer2').visible = this.inside;
    }

    getDoorHeroIsFacing(): Door | undefined {
        let row: number = this.hero.mapRow;
        let col: number = this.hero.mapCol;
        switch (this.hero.direction) {
            case Direction.NORTH:
                row--;
                break;
            case Direction.SOUTH:
                row++;
                break;
            case Direction.EAST:
                col++;
                break;
            case Direction.WEST:
                col--;
                break;
        }
        console.log(`Checking for door at: ${row}, ${col}`);
        return this.getMap().doors.find((door) => door.isAt(row, col));
    }

    getNpcHeroIsFacing(): Npc | undefined {

        let row: number = this.hero.mapRow;
        let col: number = this.hero.mapCol;

        do {
            switch (this.hero.direction) {
                case Direction.NORTH:
                    row--;
                    break;
                case Direction.SOUTH:
                    row++;
                    break;
                case Direction.EAST:
                    col++;
                    break;
                case Direction.WEST:
                    col--;
                    break;
            }
        } while (this.getShouldTalkAcross(row, col));

        return this.getMap().npcs.find((npc) => npc.isAt(row, col));
    }

    private getShouldTalkAcross(row: number, col: number): boolean {
        return !!this.getMap().talkAcrosses.get(toLocationString(row, col));
    }

    getUsingTorch(): boolean {
        return this.torch;
    }

    getWeapon(weapon: string): Weapon {
        const weaponMap: EquipmentMap<Weapon> = this.assets.get('weapons');
        return weaponMap[ weapon ];
    }

    getArmor(armor: string): Armor {
        const armorMap: EquipmentMap<Armor> = this.assets.get('armor');
        return armorMap[ armor ];
    }

    getCheatsEnabled(): boolean {
        return true;
    }

    getShield(shield: string): Shield {
        const shieldMap: EquipmentMap<Shield> = this.assets.get('shields');
        return shieldMap[ shield ];
    }

    getTileSize(): number {
        return 16 * this.scale;
    }

    getCollisionLayer(): TiledLayer {
        return this.getMap().getLayer('collisionLayer');
    }

    bump() {
        if (this.playTime > this.bumpSoundDelay) {
            this.audio.playSound('bump');
            this.bumpSoundDelay = this.playTime + 300;
        }
    }

    removeChest(chest: Chest) {
        this.gameState.mapStates[this.getMap().name].openedChests.push(chest.id);
        this.getMap().removeChest(chest);
    }

    removeHiddenItem(hiddenItem: HiddenItem) {
        this.gameState.mapStates[this.getMap().name].obtainedHiddenItems.push(hiddenItem.id);
        this.getMap().removeHiddenItem(hiddenItem);
    }

    override renderStatusMessageImpl(ctx: CanvasRenderingContext2D, message: string, color: string) {
        const x = 6;
        const y = this.canvas.height - 24;

        // Slightly larger rectangle for the background, just to look a little nicer
        const font = this.getFont();
        const w = font.stringWidth(message) + 4;
        const h = font.cellH + 4;
        ctx.fillStyle = 'black';
        ctx.fillRect(x - 2, y - 2, w, h);

        this.drawString(message, x, y);
    }

    setHeroStats(hp: number | null, maxHp: number | null, mp?: number, maxMp?: number) {
        if (hp !== null) { // null => keep the same
            this.hero.hp = hp;
        }
        if (maxHp != null) { // null => keep the same
            this.hero.maxHp = maxHp;
        }
        if (typeof mp !== 'undefined') {
            this.hero.mp = mp;
        }
        if (typeof maxMp !== 'undefined') {
            this.hero.maxMp = maxMp;
        }
        this.setStatusMessage(
            `Hero stats now: ${this.hero.hp}/${this.hero.maxHp}, ${this.hero.mp}/${this.hero.maxMp}`);
    }

    setNpcsPaused(paused: boolean) {
        this.npcsPaused = paused;
    }

    setUsingTorch(usingTorch: boolean): boolean {
        this.torch = usingTorch;
        this.setStatusMessage(`Using torch: ${usingTorch}`);
        return true;
    }

    stringHeight(): number {
        const font: BitmapFont = this.assets.get('font'); // Need as 2 lines to appease linter
        return font.cellH; //charHeight();
    }

    stringWidth(str?: string): number {
        const font: BitmapFont = this.assets.get('font'); // Need as 2 lines to appease linter
        return str ? str.length * font.cellW : 0;
    }

    startRandomEncounter(): boolean {
        if (this.randomEncounters) {
            const enemyTerritoryLayer: TiledLayer | undefined = this.getMap().layersByName.get('enemyTerritoryLayer');
            if (enemyTerritoryLayer) {
                let territory: number = enemyTerritoryLayer.getData(this.hero.mapRow, this.hero.mapCol);
                if (territory > 0) {
                    // Enemy territory index is offset by the Tiled tileset's firstgid
                    // TODO: Remove call to private method
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                    territory = territory - (this.map as any).getTilesetForGid(territory).firstgid;
                    if (territory >= 0) {
                        const territories: string[][] = this.assets.get('enemyTerritories');
                        const possibleEnemies: string[] = territories[territory];
                        const enemyName: string = possibleEnemies[Utils.randomInt(0, possibleEnemies.length)];
                        this.setState(new BattleTransitionState(this,
                            this.state as BaseState, new BattleState(this, enemyName),
                        ));
                        return true;
                    }
                }
            }
        }
        return false;
    }

    override toggleMuted(): boolean {
        const muted: boolean = this.audio.toggleMuted();
        this.setStatusMessage(muted ? 'Audio muted' : 'Audio enabled');
        return muted;
    }

    toggleRandomEncounters() {
        this.randomEncounters = !this.randomEncounters;
        this.setStatusMessage('Random encounters ' +
            (this.randomEncounters ? 'enabled' : 'disabled'));
    }

    toggleShowCollisionLayer() {
        const layer: TiledLayer = this.getCollisionLayer();
        layer.visible = !layer.visible;
        this.setStatusMessage(layer.visible ?
            'Collision layer showing' : 'Collision layer hidden');
    }

    toggleShowTerritoryLayer() {
        const layer: TiledLayer = this.getMap().getLayer('enemyTerritoryLayer');
        layer.visible = !layer.visible;
        this.setStatusMessage(layer.visible ?
            'Territory layer showing' : 'Territory layer hidden');
    }

}
