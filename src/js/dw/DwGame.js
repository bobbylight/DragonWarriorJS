dw.DwGame = function() {
   'use strict';
   gtp.Game.apply(this, arguments);
   this.map = null;
   this._drawMapCount = 0;
};

dw.DwGame.prototype = Object.create(gtp.Game.prototype, {
   
   start: {
      value: function() {
         'use strict';
         gtp.Game.prototype.start.apply(this, arguments);
         this._init();
      }
   },
   
   _init: {
      value: function() {
         'use strict';
         this._createPartyAndHero();
         this.npcs = [];
         this._bumpSoundDelay = 0;
         this._mapLogics = {};
         this.setCameraOffset(0, 0);
         this.inside = false;
         this._randomEncounters = true;
      }
   },
   
   actionKeyPressed: {
      value: function() {
         'use strict';
         return this.inputManager.isKeyDown(gtp.Keys.Z, true);
      }
   },
   
   anyKeyDown: {
      value: function(clear) {
         'use strict';
         if (typeof clear === 'undefined') {
            clear = true;
         }
         var im = this.inputManager;
         return im.isKeyDown(gtp.Keys.Z, clear) || im.isKeyDown(gtp.Keys.X, clear) ||
               im.enter(clear);
      }
   },
   
   cancelKeyPressed: {
      value: function() {
         'use strict';
         return this.inputManager.isKeyDown(gtp.Keys.X, true);
      }
   },
   
   _createPartyAndHero: {
      value: function() {
         'use strict';
         this.hero = new dw.Hero({ name: 'Erdrick' });
         this.party = new dw.Party(this);
         this.party.addMember(this.hero);
      }
   },
   
   update: {
      value: function() {
         'use strict';
         gtp.Game.prototype.update.call(this);
      }
   },
   
   cycleArmor: {
      value: function() {
         'use strict';
         if (game.hero && game.hero.armor) {
            var curArmor = game.hero.armor.name;
            var armorArray = game.assets.get('armorArray');
            var i;
            for (i=0; i<armorArray.length; i++) {
               if (curArmor === armorArray[i].name) {
                  break;
               }
            }
            i = (i + 1) % armorArray.length;
            game.hero.armor = armorArray[i];
            this.setStatusMessage('Armor changed to: ' + game.hero.armor.name);
         }
      }
   },
   
   cycleShield: {
      value: function() {
         'use strict';
         if (game.hero && game.hero.shield) {
            var curShield = game.hero.shield.name;
            var shieldArray = game.assets.get('shieldArray');
            var i;
            for (i=0; i<shieldArray.length; i++) {
               if (curShield === shieldArray[i].name) {
                  break;
               }
            }
            i = (i + 1) % shieldArray.length;
            game.hero.shield = shieldArray[i];
            this.setStatusMessage('dw.Shield changed to: ' + game.hero.shield.name);
         }
      }
   },
   
   cycleWeapon: {
      value: function() {
         'use strict';
         if (game.hero && game.hero.weapon) {
            var curWeapon = game.hero.weapon.name;
            var weaponArray = game.assets.get('weaponsArray');
            var i;
            for (i=0; i<weaponArray.length; i++) {
               if (curWeapon === weaponArray[i].name) {
                  break;
               }
            }
            i = (i + 1) % weaponArray.length;
            game.hero.weapon = weaponArray[i];
            this.setStatusMessage('Weapon changed to: ' + game.hero.weapon.name);
         }
      }
   },
   
   drawArrow: {
      value: function(x, y) {
         'use strict';
         this.drawString('\u007f', x, y);
      }
   },
   
   drawDownArrow: {
      value: function(x, y) {
         'use strict';
         this.drawString('\\', x, y); // '\' char replaced by down arrow
      }
   },
   
   drawMap: {
      value: function(ctx) {
         'use strict';
         var hero = game.hero;
         var centerCol = hero.mapCol;
         var centerRow = hero.mapRow;
         var dx = hero.xOffs + this._cameraDx;
         var dy = hero.yOffs + this._cameraDy;
         this._drawMapCount++;
         if (this.inside) {
            this.clearScreen('#000000');
         }
//         if (this._drawMapCount === 10) {
//            this.timer.start('drawMap');
//         }
         this.map.draw(ctx, centerRow, centerCol, dx, dy);
//         if (this._drawMapCount === 10) {
//            this.timer.endAndLog('drawMap');
//            this._drawMapCount = 0;
//         }
      }
   },
   
   drawString: {
      value: function(text, x, y) {
         'use strict';
         if (!text.charAt) { // Allow us to pass in stuff like numerics
            text = text.toString();
         }
         this.assets.get('font').drawString(text, x, y);
      }
   },
   
   getEnemy: {
      value: function(name) {
         'use strict';
         return this.assets.get('enemies')[name];
      }
   },
   
   getMapLogic: {
      value: function() {
         'use strict';
         var logicFile = this.map.properties.logicFile;
         logicFile = logicFile.charAt(0).toUpperCase() + logicFile.substring(1);
         console.log(logicFile);
         var logic = this._mapLogics[logicFile];
         if (!logic) {
            logic = this._mapLogics[logicFile] = new window[logicFile]();
         }
         return logic;
      }
   },
   
   getMapXOffs: {
      value: function() {
         'use strict';
         var hero = this.hero;
         var centerCol = hero.mapCol;
         var dx = hero.xOffs;
         var tileSize = this.getTileSize();
         var xOffs = centerCol*tileSize + tileSize/2 + dx - this.getWidth()/2;
         return xOffs;
      },
   },
      
   getMapYOffs: {
      value: function() {
         'use strict';
         var hero = this.hero;
         var centerRow = hero.mapRow;
         var dy = hero.yOffs;
         var tileSize = this.getTileSize();
         var yOffs = centerRow*tileSize + tileSize/2 + dy - this.getHeight()/2;
         return yOffs;
      }
   },
   
   getParty: {
      value: function() {
         'use strict';
         return this.party;
      }
   },
   
   /**
    * Returns whether the tile at a given location has a "roof" layer tile.
    */
   hasRoofTile: {
      value: function(row, col) {
         'use strict';
         var roofLayer = this.map.getLayer('tileLayer2');
         return roofLayer && roofLayer.getData(row, col) > 0;
      }
   },
   
   /**
    * Starts loading a new map.  Fades out of the old one and into the new one.
    */
   loadMap: {
      value: function(mapName, newRow, newCol, dir) {
         'use strict';
         this.newRow = newRow;
         this.newCol = newCol;
         this.audio.playSound('stairs');
         var self = this;
         var updatePlayer = function() {
            self.hero.setMapLocation(-1, -1); // Free the location he was in in the map
            self.setMap(mapName + '.json');
            self.hero.setMapLocation(newRow, newCol);
            self.hero.direction = typeof dir === 'undefined' ? dw.Direction.SOUTH : dir;
            self.inputManager.clearKeyStates(); // Prevent keydown from being read in the next screen
         };
         this.setState(new /*FadeOutInState*/dw.MapChangeState(this.state, this.state, updatePlayer));
      }
   },
   
   /**
    * If the hero is facing a door, it is opened.  Otherwise, nothing
    * happens.
    *
    * @return {boolean} Whether there was a door to open.
    */
   openDoorHeroIsFacing: {
      value: function() {
         'use strict';
         var door = this._getDoorHeroIsFacing();
         if (door) {
            this.audio.playSound('door');
            this.map.getLayer('tileLayer').setData(door.row, door.col,
                  door.replacementTileIndex);
            var index = this.map.doors.indexOf(door);
            if (index > -1) {
               this.map.doors.splice(index, 1);
               this.map.getLayer("collisionLayer").setData(door.row, door.col, 0);
            }
            else { // Should never happen
               console.error('Door not found in map.doors! - ' + door);
            }
            return true;
         }
         return false;
      }
   },
   
   _resetMap: {
      value: function(map) {
         'use strict';
         for (var i=0; i<map.npcs.length; i++) {
            map.npcs[i].reset();
         }
      }
   },
   
   setMap: {
      value: function(assetName) {
         'use strict';
         console.log('Setting map to: ' + assetName);
         this.map = this.maps[assetName];
         this._resetMap(this.map);
         var newMusic = dw.Sounds[this.map.properties.music];
         if (newMusic !== this.audio.getCurrentMusic()) {
            this.audio.fadeOutMusic(newMusic);
         }
      }
   },
   
   initLoadedMap: {
      value: function(asset) {
         'use strict';
         
         var data = this.assets.get(asset);
         var imagePathModifier = function(imagePath) {
            return imagePath.replace('../', 'res/');
         };
         
         if (!this.maps) {
            this.maps = {};
         }
         
         var map = new tiled.TiledMap(data, {
            imagePathModifier: imagePathModifier,
            tileWidth: 16, tileHeight: 16,
            screenWidth: game.getWidth(), screenHeight: game.getHeight()
         });
         this._adjustGameMap(map);
         map.setScale(this._scale);
         
         this.maps[asset] = map;
         return map;
      }
   },
   
   _adjustGameMap: { // TODO: Wrap class in closure and hide this function
      value: function(map) {
         'use strict';

         var i, npc, door;
         
         // Hide layers that shouldn't be shown (why aren't they marked as hidden
         // in Tiled?)
         for (i=0; i<map.getLayerCount(); i++) {
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
               var obj = npcLayer.objects[i];
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
                     newTalkAcrosses[this._parseTalkAcrossKey(obj)] = true;
                     break;
                  default:
                     console.error('Unhandled object type in tiled map: ' + obj.type);
                     break;
               }
            }
            
            map.removeLayer("npcLayer");
            
         }
         
         map.npcs = newNpcs;
         map.npcs.forEach(function(npc) {
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
   },
   
   _parseDoor: {
      value: function(obj) {
         'use strict';
         var name = obj.name;
         var replacementTileIndex = 
               parseInt(obj.properties.replacementTileIndex, 10);
         var tileSize = this.getTileSize();
         var row = obj.y / tileSize;
         var col = obj.x / tileSize;
         return new dw.Door(name, row, col, replacementTileIndex);
      }
   },
   
   _parseNpc: {
      value: function(obj) {
         'use strict';
         //var index = 0;
         var name = obj.name;
         var type;
         if (obj.properties.type) {
            type = dw.NpcType[obj.properties.type.toUpperCase()];
         }
         if (type == null) { // 0 is a valid value
            type = dw.NpcType.MERCHANT_GREEN;
         }
         var tileSize = this.getTileSize();
         var row = obj.y / tileSize;
         var col = obj.x / tileSize;
         var dir = dw.Direction.SOUTH;
         var tempDir = obj.properties.dir;
         if (tempDir) {
            dir = dw.Direction[tempDir.toUpperCase()];// || dw.Direction.SOUTH;
            if (typeof dir === 'undefined') {
               dir = dw.Direction.SOUTH;
            }
         }
         var wanders = true;
         var wanderStr = obj.properties.wanders;
         if (wanderStr) {
            wanders = wanderStr==='true';
         }
         var range = this._parseRange(obj.properties.range);
         var npc = new dw.Npc({ name: name, type: type, direction: dir,
                     range: range, wanders: wanders, mapRow: row, mapCol: col });
         return npc;
      }
   },
   
   _parseRange: {
      value: function(rangeStr) {
         'use strict';
         var range = null;
         if (rangeStr) {
            range = rangeStr.split(/,\s*/);
            range = range.map(function(value) {
               return parseInt(value);
            });
         }
         return range;
      }
   },
   
   _parseTalkAcrossKey: {
      value: function(obj) {
         'use strict';
         var tileSize = this.getTileSize();
         var row = obj.y / tileSize;
         var col = obj.x / tileSize;
         return this._getTalkAcrossKey(row, col);
      }
   },
   
   _getTalkAcrossKey: {
      value: function(row, col) {
         'use strict';
         return row + ',' + col;
      }
   },
   
   _loadGame: {
      value: function() {
         'use strict';
         var hero = game.hero;
         hero.hp = hero.maxHp = 15;
         hero.mp = hero.maxMp = 15;
         hero._strength = 4;
         hero.agility = 4;
         hero.weapon = game.assets.get('weapons').club;
         hero.armor = game.assets.get('armor').clothes;
         hero.shield = game.assets.get('shields').smallShield;
      }
   },
   
   setCameraOffset: {
      value: function(dx, dy) {
         'use strict';
         this._cameraDx = dx;
         this._cameraDy = dy;
      }
   },
   
   startNewGame: {
      value: function() {
         'use strict';
         this._loadGame();
         var transitionLogic = function() {
//            game.setMap('overworld.json');
//            game.hero.setMapLocation(52, 45);
game.setMap('brecconary.json');
game.hero.setMapLocation(7, 6);
         };
         game.setState(new gtp.FadeOutInState(this.state, new dw.RoamingState(), transitionLogic));
      }
   },
   
   setInsideOutside: {
      value: function(inside) {
         'use strict';
         this.inside = inside;
         this.map.getLayer('tileLayer').visible = !this.inside;
         this.map.getLayer('tileLayer2').visible = this.inside;
      }
   },
   
   _getDoorHeroIsFacing: {
      value: function() {
         'use strict';
         var row = this.hero.mapRow, col = this.hero.mapCol;
         switch (this.hero.direction) {
            case dw.Direction.NORTH:
               row--;
               break;
            case dw.Direction.SOUTH:
               row++;
               break;
            case dw.Direction.EAST:
               col++;
               break;
            case dw.Direction.WEST:
               col--;
               break;
         }
         console.log('Checking for door at: ' + row + ', ' + col);
         for (var i=0; i<this.map.doors.length; i++) {
            var door = this.map.doors[i];
            console.log('... ' + door);
            if (door.isAt(row, col)) {
               return door;
            }
         }
         return null;
      }
   },
   
   getNpcHeroIsFacing: {
      value: function() {
         'use strict';
         var row = this.hero.mapRow, col = this.hero.mapCol;
         do {
            switch (this.hero.direction) {
               case dw.Direction.NORTH:
                  row--;
                  break;
               case dw.Direction.SOUTH:
                  row++;
                  break;
               case dw.Direction.EAST:
                  col++;
                  break;
               case dw.Direction.WEST:
                  col--;
                  break;
            }
         } while (this.getShouldTalkAcross(row, col));
         for (var i=0; i<this.map.npcs.length; i++) {
            var npc = this.map.npcs[i];
            if (npc.isAt(row, col)) {
               return npc;
            }
         }
         return null;
      }
   },
   
   getShouldTalkAcross: {
      value: function(row, col) {
         'use strict';
         return this.map.talkAcrosses[this._getTalkAcrossKey(row, col)];
      }
   },
   
   getWeapon: {
      value: function(weapon) {
         'use strict';
         return this.assets.get('weapons')[weapon];
      }
   },
   
   getArmor: {
      value: function(armor) {
         'use strict';
         return this.assets.get('armors')[armor];
      }
   },
   
   getShield: {
      value: function(shield) {
         'use strict';
         return this.assets.get('shields')[shield];
      }
   },
   
   getTileSize: {
      value: function() {
         'use strict';
         return 16 * this._scale;
      }
   },
   
   getCollisionLayer: {
      value: function() {
         'use strict';
         return game.map.getLayer('collisionLayer');
      }
   },
   
   getEnemyTerritoryLayer: {
      value: function() {
         'use strict';
         return game.map.getLayer('enemyTerritoryLayer');
      }
   },
   
   bump: {
      value: function() {
         'use strict';
         if (this._gameTime>this._bumpSoundDelay) {
            this.audio.playSound('bump');
            this._bumpSoundDelay = this._gameTime + 300;
         }
      }
   },
   
   setHeroStats: {
      value: function(hp, maxHp, mp, maxMp) {
         'use strict';
         if (hp) {
            game.hero.hp = hp;
         }
         if (maxHp) {
            game.hero.maxHp = maxHp;
         }
         if (typeof mp !== 'undefined') {
            game.hero.mp = mp;
         }
         if (typeof maxMp !== 'undefined') {
            game.hero.maxMp = maxMp;
         }
         game.setStatusMessage('Hero stats now: ' + game.hero.hp + '/' + game.hero.maxHp +
               ', ' + game.hero.mp + '/' + game.hero.maxMp);
      }
   },
   
   setNpcsPaused: {
      value: function(paused) {
         'use strict';
         this.npcsPaused = paused;
      }
   },
   
   stringHeight: {
      value: function() {
         'use strict';
         return this.assets.get('font').cellH;//charHeight();
      }
   },
   
   stringWidth: {
      value: function(str) {
         'use strict';
         return str ? (str.length*this.assets.get('font').cellW) : 0;
      }
   },
   
   startRandomEncounter: {
      value: function() {
         'use strict';
         if (this._randomEncounters) {
            var enemyTerritoryLayer = game.getEnemyTerritoryLayer();
            if (enemyTerritoryLayer) {
               var territory = enemyTerritoryLayer.getData(game.hero.mapRow, game.hero.mapCol);
               if (territory > 0) {
                  // dw.Enemy territory index is offset by the Tiled tileset's firstgid
                  // TODO: Remove call to private method
                  territory = territory - game.map._getImageForGid(territory).firstgid;
                  if (territory >= 0) {
                     var territories = game.assets.get('enemyTerritories');
                     var possibleEnemies = territories[territory];
                     var enemyName = possibleEnemies[gtp.Utils.randomInt(0, possibleEnemies.length)];
                     this.setState(new dw.BattleTransitionState(this.state, new dw.BattleState(enemyName)));
                     return true;
                  }
               }
            }
         }
         return false;
      }
   },
   
   toggleMuted: {
      value: function() {
         'use strict';
         var muted = this.audio.toggleMuted();
         this.setStatusMessage(muted ? 'Audio muted' : 'Audio enabled');
      }
   },
   
   toggleRandomEncounters: {
      value: function() {
         'use strict';
         this._randomEncounters = !this._randomEncounters;
         this.setStatusMessage('Random encounters ' +
               (this._randomEncounters ? 'enabled' : 'disabled'));
      }
   },
   
   toggleShowCollisionLayer: {
      value: function() {
         'use strict';
         var layer = this.getCollisionLayer();
         layer.visible = !layer.visible;
         this.setStatusMessage(layer.visible ?
               'Collision layer showing' : 'Collision layer hidden');
      }
   },
   
   toggleShowTerritoryLayer: {
      value: function() {
         'use strict';
         var layer = this.map.getLayer('enemyTerritoryLayer');
         layer.visible = !layer.visible;
         this.setStatusMessage(layer.visible ?
               'Territory layer showing' : 'Territory layer hidden');
      }
   },
   
});

dw.DwGame.prototype.constructor = dw.DwGame;
