import {
    BitmapFont,
    FadeOutInState,
    Game,
    InputManager,
    Keys,
    TiledImagePathModifier,
    TiledLayer,
    TiledMapData,
    TiledObject,
    Utils
} from 'gtp';
import Hero from './Hero';
import Shield from './Shield';
import Npc from './Npc';
import Armor from './Armor';
import Weapon from './Weapon';
import Direction from './Direction';
import NpcType from './NpcType';
import Door from './Door';
import Party from './Party';
import Sounds from './Sounds';
import MapChangeState from './MapChangeState';
import RoamingState from './RoamingState';
import DwMap from './DwMap';
import BattleState from './BattleState';
import BattleTransitionState from './BattleTransitionState';

import Brecconary from './mapLogic/brecconary';
import ErdricksCave1 from './mapLogic/erdricksCave1';
import ErdricksCave2 from './mapLogic/erdricksCave2';
import Garinham from './mapLogic/garinham';
import Overworld from './mapLogic/overworld';
import TantegelCastle from './mapLogic/tantegelCastle';
import MapLogic from './mapLogic/MapLogic';
import { EquipmentMap } from './dw';
import { getProperty } from 'gtp/lib/tiled/TiledPropertiesContainer';

export interface TiledMapMap {
    [ name: string ]: DwMap;
}

export default class DwGame extends Game {

    map: DwMap;
    maps: TiledMapMap;
    hero: Hero;
    party: Party;
    npcs: Npc[];
    private _bumpSoundDelay: number;
    private _mapLogics: Map<String, MapLogic>;
    private _randomEncounters: boolean;
    private _torch: boolean;
    inside: boolean;
    newRow: number;
    newCol: number;
    npcsPaused: boolean;
    private _cameraDx: number;
    private _cameraDy: number;

    constructor(args?: any) {

        super(args);
    }

    start() {
        Game.prototype.start.apply(this);
        this.init();
    }

    private init() {

        this.createPartyAndHero();
        this.npcs = [];
        this._bumpSoundDelay = 0;
        this.setCameraOffset(0, 0);
        this.inside = false;
        this._randomEncounters = true;
        this._torch = false;

        this._mapLogics = new Map<String, MapLogic>();
        this._mapLogics.set('Brecconary', new Brecconary());
        this._mapLogics.set('erdricksCave1', new ErdricksCave1());
        this._mapLogics.set('erdricksCave2', new ErdricksCave2());
        this._mapLogics.set('Garinham', new Garinham());
        this._mapLogics.set('Overworld', new Overworld());
        this._mapLogics.set('TantegelCastle', new TantegelCastle());
    }

    actionKeyPressed() {
        return this.inputManager.isKeyDown(Keys.KEY_Z, true);
    }

    anyKeyDown(clear: boolean = true) {
        const im: InputManager = this.inputManager;
        return im.isKeyDown(Keys.KEY_Z, clear) || im.isKeyDown(Keys.KEY_X, clear) ||
            im.enter(clear);
    }

    cancelKeyPressed() {
        return this.inputManager.isKeyDown(Keys.KEY_X, true);
    }

    private createPartyAndHero() {
        this.hero = new Hero({ name: 'Erdrick' });
        this.party = new Party(this);
        this.party.addMember(this.hero);
    }

    update() {
        Game.prototype.update.call(this);
    }

    cycleArmor() {
        if (this.hero && this.hero.armor) {
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
        if (this.hero && this.hero.shield) {
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
        if (this.hero && this.hero.weapon) {
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
        const dx: number = hero.xOffs + this._cameraDx;
        const dy: number = hero.yOffs + this._cameraDy;

//         if (this._drawMapCount === 10) {
//            this.timer.start('drawMap');
//         }
        this.map.draw(ctx, centerRow, centerCol, dx, dy);
//         if (this._drawMapCount === 10) {
//            this.timer.endAndLog('drawMap');
//            this._drawMapCount = 0;
//         }

    }

    drawString(text: string | number, x: number, y: number) {
        const textStr: string = (text as any).charAt ? text as string : text.toString();
        const font: BitmapFont = this.assets.get('font'); // Need as 2 lines to appease linter
        font.drawString(textStr, x, y);
    }

    getEnemy(name: string): any {
        return this.assets.get<any>('enemies')[ name ];
    }

    getMapLogic(): MapLogic | undefined {
        let logicFile: string = this.map.getProperty('logicFile');
        logicFile = logicFile.charAt(0).toUpperCase() + logicFile.substring(1);
        console.log(logicFile);
        return this._mapLogics.get(logicFile);
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
        const roofLayer: TiledLayer | undefined = this.map.getLayerIfExists('tileLayer2');
        return roofLayer ? roofLayer.getData(row, col) > 0 : false;
    }

    /**
     * Starts loading a new map.  Fades out of the old one and into the new one.
     */
    loadMap(mapName: string, newRow: number, newCol: number, dir: any) {
        this.newRow = newRow;
        this.newCol = newCol;
        this.audio.playSound('stairs');
        const updatePlayer: Function = () => {
            this.hero.setMapLocation(-1, -1); // Free the location he was in the map
            this.setMap(mapName + '.json');
            this.hero.setMapLocation(newRow, newCol);
            this.hero.direction = dir ?? Direction.SOUTH;
            this.inputManager.clearKeyStates(); // Prevent keydown from being read in the next screen
        };
        this.setState(new /*FadeOutInState*/MapChangeState(this.state as any, this.state as any, updatePlayer));
    }

    _resetMap(map: any) {
        map.npcs.forEach(npc => npc.reset());
    }

    setMap(assetName: string) {
        const prevMap: DwMap = this.map;
        console.log('Setting map to: ' + assetName);
        this.map = this.maps[ assetName ];
        this._resetMap(this.map);
        if (prevMap && prevMap.getProperty('requiresTorch', false) !== this.map.getProperty('requiresTorch', false)) {
            // You blow your torch out leaving a dungeon, but it stays lit
            // when going into another map in the same dungeon that is also dark
            this.setUsingTorch(false);
        }
        const newMusic: string = Sounds[this.map.getProperty('music') as string];
        if (newMusic !== this.audio.getCurrentMusic()) {
            this.audio.fadeOutMusic(newMusic);
        }
    }

    initLoadedMap(asset: string): DwMap {

        const data: TiledMapData = this.assets.get(asset);
        const imagePathModifier: TiledImagePathModifier = (imagePath: string) => {
            return imagePath.replace('../', 'res/');
        };

        if (!this.maps) {
            this.maps = {};
        }

        const map: DwMap = new DwMap(data, {
            imagePathModifier: imagePathModifier,
            screenWidth: this.getWidth(),
            screenHeight: this.getHeight(),
            assets: this.assets,
        });
        map.setScale(this.scale);
        this._adjustGameMap(map);

        this.maps[ asset ] = map;
        return map;
    }

    private _adjustGameMap(map: DwMap) {

        let i: number;
        let npc: Npc;
        let door: Door;

        // Hide layers that shouldn't be shown (why aren't they marked as hidden
        // in Tiled?)
        for (i = 0; i < map.getLayerCount(); i++) {
            const layer: TiledLayer = map.getLayerByIndex(i);
            if (layer.name !== 'tileLayer') {
                layer.visible = false;
            }
        }

        // We special-case the NPC layer
        const newNpcs: Npc[] = [];
        const newDoors: Door[] = [];
        const newTalkAcrosses: any = {};
        const temp: TiledLayer | undefined = map.layersByName.get('npcLayer');
        if (temp?.isObjectGroup()) {

            const npcLayer: TiledLayer = temp;

            for (i = 0; i < npcLayer.objects!.length; i++) {
                const obj: TiledObject = npcLayer.objects![i];
                switch (obj.type) {
                    case 'npc':
                        npc = this._parseNpc(obj);
                        npc.setNpcIndex(newNpcs.length + 1);
                        newNpcs.push(npc);
                        break;
                    case 'door':
                        door = this._parseDoor(obj);
                        //door.setDoorIndex(newDoors.length + 1);
                        newDoors.push(door);
                        break;
                    case 'talkAcross':
                        newTalkAcrosses[ this._parseTalkAcrossKey(obj) ] = true;
                        break;
                    default:
                        console.error(`Unhandled object type in tiled map: ${obj.type}`);
                        break;
                }
            }

            map.removeLayer('npcLayer');

        }

        map.npcs = newNpcs;
        map.npcs.forEach((npc: Npc) => {
            map.getLayer('collisionLayer').setData(npc.mapRow, npc.mapCol, 1);
        });
        map.talkAcrosses = newTalkAcrosses;

        map.doors = newDoors;
        // Don't need to set collision as it is already set in the map.
        // Should we require that?

//         // Hide layers we aren't interested in seeing.
//         map.getLayer('collisionLayer').setVisible(collisionLayerVisible);
//         Layer layer = map.getLayer('enemyTerritoryLayer');
//         if (layer!=null) {
//            layer.setVisible(enemyTerritoryLayerVisible);
//         }

    }

    private _parseDoor(obj: TiledObject): Door {
        const name: string = obj.name;
        const replacementTileIndex: number =
            parseInt(getProperty(obj, 'replacementTileIndex'), 10);
        const tileSize: number = this.getTileSize();
        const row: number = obj.y / tileSize;
        const col: number = obj.x / tileSize;
        return new Door(name, row, col, replacementTileIndex);
    }

    private _parseNpc(obj: TiledObject): Npc {
        const name: string = obj.name;
        let type: number | null = null;
        if (obj.propertiesByName.has('type')) {
            type = NpcType[ (getProperty(obj, 'type') as string).toUpperCase() ];
        }
        if (type == null) { // 0 is a valid value
            type = NpcType.MERCHANT_GREEN;
        }
        const tileSize: number = this.getTileSize();
        const row: number = obj.y / tileSize;
        const col: number = obj.x / tileSize;
        const tempDir: string = getProperty(obj, 'dir', 'SOUTH');
        let dir = Direction[ tempDir.toUpperCase() ]; // || Direction.SOUTH;
        if (typeof dir === 'undefined') {
            dir = Direction.SOUTH;
        }
        const wanderStr: string = getProperty(obj, 'wanders', 'true');
        const wanders: boolean = wanderStr === 'true';
        const range: number[] = this._parseRange(getProperty(obj, 'range', ''));
        const npc: Npc = new Npc({
            name, type, direction: dir,
            range, wanders, mapRow: row, mapCol: col
        });
        return npc;
    }

    private _parseRange(rangeStr?: string): number[] {
        let range: number[] = [];
        if (rangeStr) {
            const temp: string[] = rangeStr.split(/,\s*/);
            range = temp.map((value: string) => {
                return parseInt(value, 10);
            });
        }
        return range;
    }

    private _parseTalkAcrossKey(obj: any): string {
        const tileSize: number = this.getTileSize();
        const row: number = obj.y / tileSize;
        const col: number = obj.x / tileSize;
        return DwGame.getTalkAcrossKey(row, col);
    }

    private static getTalkAcrossKey(row: number, col: number): string {
        return row + ',' + col;
    }

    _loadGame() {
        const hero: Hero = this.hero;
        hero.hp = hero.maxHp = 15;
        hero.mp = hero.maxMp = 15;
        hero._strength = 4;
        hero.agility = 4;
        hero.weapon = (this.assets.get('weapons') as EquipmentMap<Weapon>).club;
        hero.armor = (this.assets.get('armor') as EquipmentMap<Armor>).clothes;
        hero.shield = (this.assets.get('shields') as EquipmentMap<Shield>).smallShield;
    }

    setCameraOffset(dx: number, dy: number) {
        this._cameraDx = dx;
        this._cameraDy = dy;
    }

    startNewGame() {
        this._loadGame();
        const transitionLogic: Function = () => {
//            this.setMap('overworld.json');
//            this.hero.setMapLocation(52, 45);
            this.setMap('brecconary.json');
            this.hero.setMapLocation(7, 6);
        };
        this.setState(new FadeOutInState(this.state, new RoamingState(), transitionLogic));
    }

    setInsideOutside(inside: boolean) {
        this.inside = inside;
        this.map.getLayer('tileLayer').visible = !this.inside;
        this.map.getLayer('tileLayer2').visible = this.inside;
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
        console.log('Checking for door at: ' + row + ', ' + col);
        return this.map.doors.find(door => door.isAt(row, col));
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

        return this.map.npcs.find(npc => npc.isAt(row, col));
    }

    getShouldTalkAcross(row: number, col: number): boolean {
        return this.map.talkAcrosses[ DwGame.getTalkAcrossKey(row, col) ];
    }

    getUsingTorch(): boolean {
        return this._torch;
    }

    getWeapon(weapon: string): Weapon {
        return this.assets.get<any>('weapons')[ weapon ];
    }

    getArmor(armor: string): Armor {
        return this.assets.get<any>('armors')[ armor ];
    }

    getCheatsEnabled(): boolean {
        return true;
    }

    getShield(shield: string): Shield {
        return this.assets.get<any>('shields')[ shield ];
    }

    getTileSize(): number {
        return 16 * this.scale;
    }

    getCollisionLayer(): TiledLayer {
        return this.map.getLayer('collisionLayer');
    }

    bump() {
        if (this.playTime > this._bumpSoundDelay) {
            this.audio.playSound('bump');
            this._bumpSoundDelay = this.playTime + 300;
        }
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
        this.setStatusMessage('Hero stats now: ' + this.hero.hp + '/' + this.hero.maxHp +
            ', ' + this.hero.mp + '/' + this.hero.maxMp);
    }

    setNpcsPaused(paused: boolean) {
        this.npcsPaused = paused;
    }

    setUsingTorch(usingTorch: boolean): boolean {
        this._torch = usingTorch;
        this.setStatusMessage('Using torch: ' + usingTorch);
        return true;
    }

    stringHeight(): number {
        const font: BitmapFont = this.assets.get('font'); // Need as 2 lines to appease linter
        return font.cellH; //charHeight();
    }

    stringWidth(str?: string): number {
        const font: BitmapFont = this.assets.get('font'); // Need as 2 lines to appease linter
        return str ? (str.length * font.cellW) : 0;
    }

    startRandomEncounter(): boolean {
        if (this._randomEncounters) {
            const enemyTerritoryLayer: TiledLayer | undefined = this.map.layersByName.get('enemyTerritoryLayer');
            if (enemyTerritoryLayer) {
                let territory: number = enemyTerritoryLayer.getData(this.hero.mapRow, this.hero.mapCol);
                if (territory > 0) {
                    // dw.Enemy territory index is offset by the Tiled tileset's firstgid
                    // TODO: Remove call to private method
                    territory = territory - (this.map as any).getTilesetForGid(territory).firstgid;
                    if (territory >= 0) {
                        const territories: any = this.assets.get('enemyTerritories');
                        const possibleEnemies: any[] = territories[territory];
                        const enemyName: string = possibleEnemies[Utils.randomInt(0, possibleEnemies.length)];
                        this.setState(new BattleTransitionState(this.state as any, new BattleState(enemyName)));
                        return true;
                    }
                }
            }
        }
        return false;
    }

    toggleMuted(): boolean {
        const muted: boolean = this.audio.toggleMuted();
        this.setStatusMessage(muted ? 'Audio muted' : 'Audio enabled');
        return muted;
    }

    toggleRandomEncounters() {
        this._randomEncounters = !this._randomEncounters;
        this.setStatusMessage('Random encounters ' +
            (this._randomEncounters ? 'enabled' : 'disabled'));
    }

    toggleShowCollisionLayer() {
        const layer: TiledLayer = this.getCollisionLayer();
        layer.visible = !layer.visible;
        this.setStatusMessage(layer.visible ?
            'Collision layer showing' : 'Collision layer hidden');
    }

    toggleShowTerritoryLayer() {
        const layer: TiledLayer = this.map.getLayer('enemyTerritoryLayer');
        layer.visible = !layer.visible;
        this.setStatusMessage(layer.visible ?
            'Territory layer showing' : 'Territory layer hidden');
    }

}
