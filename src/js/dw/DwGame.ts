import { BitmapFont, FadeOutInState, Game, Keys, TiledLayer, TiledMap, Utils } from 'gtp';
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

export interface TiledMapMap {
    [ name: string ]: TiledMap[];
}

export default class DwGame extends Game {

    map: TiledMap;
    maps: TiledMapMap;
    hero: Hero;
    party: Party;
    npcs: Npc[];
    private _bumpSoundDelay: number;
    private _mapLogics: any;
    private _drawMapCount: number = 0;
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
        this.map = null;
        this._drawMapCount = 0;
    }

    start() {
        Game.prototype.start.apply(this, arguments);
        this._init();
    }

    _init() {
        this._createPartyAndHero();
        this.npcs = [];
        this._bumpSoundDelay = 0;
        this._mapLogics = {};
        this.setCameraOffset(0, 0);
        this.inside = false;
        this._randomEncounters = true;
        this._torch = false;
    }

    actionKeyPressed() {
        'use strict';
        return this.inputManager.isKeyDown(Keys.KEY_Z, true);
    }

    anyKeyDown(clear: boolean = true) {
        var im = this.inputManager;
        return im.isKeyDown(Keys.KEY_Z, clear) || im.isKeyDown(Keys.KEY_X, clear) ||
            im.enter(clear);
    }

    cancelKeyPressed() {
        return this.inputManager.isKeyDown(Keys.KEY_X, true);
    }

    _createPartyAndHero() {
        this.hero = new Hero({ name: 'Erdrick' });
        this.party = new Party(this);
        this.party.addMember(this.hero);
    }

    update() {
        Game.prototype.update.call(this);
    }

    cycleArmor() {
        if (this.hero && this.hero.armor) {
            var curArmor = this.hero.armor.name;
            const armorArray: Armor[] = this.assets.get('armorArray');
            var i;
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
            let i;
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
            var curWeapon = this.hero.weapon.name;
            const weaponArray: Weapon[] = this.assets.get('weaponsArray');
            var i;
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
        this.drawString('\u007f', x, y);
    }

    drawDownArrow(x: number, y: number) {
        this.drawString('\\', x, y); // '\' char replaced by down arrow
    }

    drawMap(ctx: CanvasRenderingContext2D) {
        var hero = this.hero;
        var centerCol = hero.mapCol;
        var centerRow = hero.mapRow;
        var dx = hero.xOffs + this._cameraDx;
        var dy = hero.yOffs + this._cameraDy;
        this._drawMapCount++;

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
        (this.assets.get('font') as BitmapFont).drawString(textStr, x, y);
    }

    getEnemy(name: string) {
        return this.assets.get('enemies')[ name ];
    }

    getMapLogic() {
        var logicFile = this.map.properties.logicFile;
        logicFile = logicFile.charAt(0).toUpperCase() + logicFile.substring(1);
        console.log(logicFile);
        var logic = this._mapLogics[ logicFile ];
        if (!logic) {
            logic = this._mapLogics[ logicFile ] = new window[ logicFile ]();
        }
        return logic;
    }

    getMapXOffs() {
        var hero = this.hero;
        var centerCol = hero.mapCol;
        var dx = hero.xOffs;
        var tileSize = this.getTileSize();
        var xOffs = centerCol * tileSize + tileSize / 2 + dx - this.getWidth() / 2;
        return xOffs;
    }

    getMapYOffs() {
        var hero = this.hero;
        var centerRow = hero.mapRow;
        var dy = hero.yOffs;
        var tileSize = this.getTileSize();
        var yOffs = centerRow * tileSize + tileSize / 2 + dy - this.getHeight() / 2;
        return yOffs;
    }

    getParty(): Party {
        return this.party;
    }

    /**
     * Returns whether the tile at a given location has a "roof" layer tile.
     */
    hasRoofTile(row: number, col: number) {
        const roofLayer: TiledLayer | null = this.map.getLayer('tileLayer2');
        return roofLayer && roofLayer.getData(row, col) > 0;
    }

    /**
     * Starts loading a new map.  Fades out of the old one and into the new one.
     */
    loadMap(mapName: string, newRow: number, newCol: number, dir: any) {
        this.newRow = newRow;
        this.newCol = newCol;
        this.audio.playSound('stairs');
        var self = this;
        var updatePlayer = function () {
            self.hero.setMapLocation(-1, -1); // Free the location he was in in the map
            self.setMap(mapName + '.json');
            self.hero.setMapLocation(newRow, newCol);
            self.hero.direction = typeof dir === 'undefined' ? Direction.SOUTH : dir;
            self.inputManager.clearKeyStates(); // Prevent keydown from being read in the next screen
        };
        this.setState(new /*FadeOutInState*/dw.MapChangeState(this.state, this.state, updatePlayer));
    }

    /**
     * If the hero is facing a door, it is opened.  Otherwise, nothing
     * happens.
     *
     * @return {boolean} Whether there was a door to open.
     */
    openDoorHeroIsFacing() {
        var door = this._getDoorHeroIsFacing();
        if (door) {
            this.audio.playSound('door');
            this.map.getLayer('tileLayer').setData(door.row, door.col,
                door.replacementTileIndex);
            var index = this.map.doors.indexOf(door);
            if (index > -1) {
                this.map.doors.splice(index, 1);
                this.map.getLayer("collisionLayer").setData(door.row, door.col, 0);
            } else { // Should never happen
                console.error('Door not found in map.doors! - ' + door);
            }
            return true;
        }
        return false;
    }

    _resetMap(map: any) {
        for (var i = 0; i < map.npcs.length; i++) {
            map.npcs[ i ].reset();
        }
    }

    setMap(assetName: string) {
        var prevMap = this.map;
        console.log('Setting map to: ' + assetName);
        this.map = this.maps[ assetName ];
        this._resetMap(this.map);
        if (prevMap && prevMap.properties.requiresTorch !== this.map.properties.requiresTorch) {
            // You blow your torch out leaving a dungeon, but it stays lit
            // when going into another map in the same dungeon that is also dark
            this.setUsingTorch(false);
        }
        var newMusic = Sounds[ this.map.properties.music ];
        if (newMusic !== this.audio.getCurrentMusic()) {
            this.audio.fadeOutMusic(newMusic);
        }
    }

    initLoadedMap(asset: string) {

        var data = this.assets.get(asset);
        var imagePathModifier = function (imagePath) {
            return imagePath.replace('../', 'res/');
        };

        if (!this.maps) {
            this.maps = {};
        }

        const map: TiledMap = new TiledMap(data, {
            imagePathModifier: imagePathModifier,
            tileWidth: 16, tileHeight: 16,
            screenWidth: this.getWidth(), screenHeight: this.getHeight()
        });
        this._adjustGameMap(map);
        map.setScale(this._scale);

        this.maps[ asset ] = map;
        return map;
    }

    private _adjustGameMap(map: any) {

        var i, npc, door;

        // Hide layers that shouldn't be shown (why aren't they marked as hidden
        // in Tiled?)
        for (i = 0; i < map.getLayerCount(); i++) {
            var layer = map.getLayerByIndex(i);
            if (layer.name !== 'tileLayer') {
                layer.visible = false;
            }
        }

        // We special-case the NPC layer
        var newNpcs = [];
        var newDoors = [];
        var newTalkAcrosses = {};
        var temp = map.getLayer("npcLayer");
        if (temp && temp.isObjectGroup()) {

            var npcLayer = temp;

            for (i = 0; i < npcLayer.objects.length; i++) {
                var obj = npcLayer.objects[ i ];
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
                        console.error('Unhandled object type in tiled map: ' + obj.type);
                        break;
                }
            }

            map.removeLayer("npcLayer");

        }

        map.npcs = newNpcs;
        map.npcs.forEach(function (npc) {
            map.getLayer("collisionLayer").setData(npc.mapRow, npc.mapCol, 1);
        });
        map.talkAcrosses = newTalkAcrosses;

        map.doors = newDoors;
        // Don't need to set collision as it is already set in the map.
        // Should we require that?

//         // Hide layers we aren't interested in seeing.
//         map.getLayer("collisionLayer").setVisible(collisionLayerVisible);
//         Layer layer = map.getLayer("enemyTerritoryLayer");
//         if (layer!=null) {
//            layer.setVisible(enemyTerritoryLayerVisible);
//         }

    }

    private _parseDoor(obj: any): Door {
        var name = obj.name;
        var replacementTileIndex =
            parseInt(obj.properties.replacementTileIndex, 10);
        var tileSize = this.getTileSize();
        var row = obj.y / tileSize;
        var col = obj.x / tileSize;
        return new Door(name, row, col, replacementTileIndex);
    }

    private _parseNpc(obj: any) {
        //var index = 0;
        var name = obj.name;
        var type;
        if (obj.properties.type) {
            type = NpcType[ obj.properties.type.toUpperCase() ];
        }
        if (type == null) { // 0 is a valid value
            type = NpcType.MERCHANT_GREEN;
        }
        var tileSize = this.getTileSize();
        var row = obj.y / tileSize;
        var col = obj.x / tileSize;
        var dir = Direction.SOUTH;
        var tempDir = obj.properties.dir;
        if (tempDir) {
            dir = Direction[ tempDir.toUpperCase() ];// || Direction.SOUTH;
            if (typeof dir === 'undefined') {
                dir = Direction.SOUTH;
            }
        }
        var wanders = true;
        var wanderStr = obj.properties.wanders;
        if (wanderStr) {
            wanders = wanderStr === 'true';
        }
        var range = this._parseRange(obj.properties.range);
        var npc = new Npc({
            name: name, type: type, direction: dir,
            range: range, wanders: wanders, mapRow: row, mapCol: col
        });
        return npc;
    }

    private _parseRange(rangeStr?: string) {
        var range = null;
        if (rangeStr) {
            range = rangeStr.split(/,\s*/);
            range = range.map(function (value) {
                return parseInt(value);
            });
        }
        return range;
    }

    private _parseTalkAcrossKey(obj: any) {
        var tileSize = this.getTileSize();
        var row = obj.y / tileSize;
        var col = obj.x / tileSize;
        return this._getTalkAcrossKey(row, col);
    }

    private _getTalkAcrossKey(row: number, col: number) {
        return row + ',' + col;
    }

    _loadGame() {
        var hero = this.hero;
        hero.hp = hero.maxHp = 15;
        hero.mp = hero.maxMp = 15;
        hero._strength = 4;
        hero.agility = 4;
        hero.weapon = (this.assets.get('weapons') as Weapon[]).club;
        hero.armor = (this.assets.get('armor') as Armor[]).clothes;
        hero.shield = (this.assets.get('shields') as Shield[]).smallShield;
    }

    setCameraOffset(dx: number, dy: number) {
        this._cameraDx = dx;
        this._cameraDy = dy;
    }

    startNewGame() {
        this._loadGame();
        var transitionLogic = function () {
//            this.setMap('overworld.json');
//            this.hero.setMapLocation(52, 45);
            this.setMap('brecconary.json');
            this.hero.setMapLocation(7, 6);
        };
        this.setState(new FadeOutInState(this.state, new dw.RoamingState(), transitionLogic));
    }

    setInsideOutside(inside: boolean) {
        this.inside = inside;
        this.map.getLayer('tileLayer').visible = !this.inside;
        this.map.getLayer('tileLayer2').visible = this.inside;
    }

    private _getDoorHeroIsFacing() {
        var row = this.hero.mapRow, col = this.hero.mapCol;
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
        for (var i = 0; i < this.map.doors.length; i++) {
            var door = this.map.doors[ i ];
            console.log('... ' + door);
            if (door.isAt(row, col)) {
                return door;
            }
        }
        return null;
    }

    getNpcHeroIsFacing() {
        var row = this.hero.mapRow, col = this.hero.mapCol;
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
        for (var i = 0; i < this.map.npcs.length; i++) {
            var npc = this.map.npcs[ i ];
            if (npc.isAt(row, col)) {
                return npc;
            }
        }
        return null;
    }

    getShouldTalkAcross(row: number, col: number) {
        return this.map.talkAcrosses[ this._getTalkAcrossKey(row, col) ];
    }

    getUsingTorch() {
        return this._torch;
    }

    getWeapon(weapon: string) {
        return this.assets.get('weapons')[ weapon ];
    }

    getArmor(armor: string) {
        return this.assets.get('armors')[ armor ];
    }

    getShield(shield: string) {
        return this.assets.get('shields')[ shield ];
    }

    getTileSize() {
        return 16 * this._scale;
    }

    getCollisionLayer() {
        return this.map.getLayer('collisionLayer');
    }

    getEnemyTerritoryLayer() {
        return this.map.getLayer('enemyTerritoryLayer');
    }

    bump() {
        if (this._gameTime > this._bumpSoundDelay) {
            this.audio.playSound('bump');
            this._bumpSoundDelay = this._gameTime + 300;
        }
    }

    setHeroStats(hp: number, maxHp: number, mp?: number, maxMp?: number) {
        if (hp) {
            this.hero.hp = hp;
        }
        if (maxHp) {
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

    setUsingTorch(usingTorch: boolean) {
        this._torch = usingTorch;
        this.setStatusMessage('Using torch: ' + usingTorch);
        return true;
    }

    stringHeight() {
        return (this.assets.get('font') as BitmapFont).cellH;//charHeight();
    }

    stringWidth(str?: string) {
        return str ? (str.length * (this.assets.get('font') as BitmapFont).cellW) : 0;
    }

    startRandomEncounter() {
        if (this._randomEncounters) {
            var enemyTerritoryLayer = this.getEnemyTerritoryLayer();
            if (enemyTerritoryLayer) {
                var territory = enemyTerritoryLayer.getData(this.hero.mapRow, this.hero.mapCol);
                if (territory > 0) {
                    // dw.Enemy territory index is offset by the Tiled tileset's firstgid
                    // TODO: Remove call to private method
                    territory = territory - this.map._getImageForGid(territory).firstgid;
                    if (territory >= 0) {
                        var territories = this.assets.get('enemyTerritories');
                        var possibleEnemies = territories[ territory ];
                        var enemyName = possibleEnemies[ Utils.randomInt(0, possibleEnemies.length) ];
                        this.setState(new dw.BattleTransitionState(this.state, new dw.BattleState(enemyName)));
                        return true;
                    }
                }
            }
        }
        return false;
    }

    toggleMuted() {
        var muted = this.audio.toggleMuted();
        this.setStatusMessage(muted ? 'Audio muted' : 'Audio enabled');
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
