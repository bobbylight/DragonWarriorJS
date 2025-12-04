import { BitmapFont, FadeOutInState, Game, Image, ImageAtlas, ImageAtlasInfo, ImageMap, Utils } from 'gtp';
import { BaseState } from './BaseState';
import { Weapon,WeaponData } from './Weapon';
import { Armor,ArmorData } from './Armor';
import { Shield,ShieldData } from './Shield';
import { DwGame } from './DwGame';
import { GameStudioAdvertState } from './GameStudioAdvertState';
import { EquipmentMap } from './dw';

export interface EquipmentData {
    weapons: Record<string, WeaponData>;
    armor: Record<string, ArmorData>;
    shields: Record<string, ShieldData>;
}

export class LoadingState extends BaseState {

    assetsLoaded: boolean;
    private textX?: number;
    private textY?: number;

    constructor(game: DwGame) {
        super(game);
        this.assetsLoaded = false;
    }

    private static createArmorArray(armors: EquipmentMap<Armor>): Armor[] {

        const armorArray: Armor[] = [];

        for (const armorName in armors) {
            if (Object.prototype.hasOwnProperty.call(armors, armorName)) {
                armorArray.push(armors[ armorName ]);
            }
        }

        armorArray.sort((a: Armor, b: Armor) => {
            return a.defense - b.defense;
        });

        return armorArray;
    }

    private static createArmorMap(armors: Record<string, ArmorData>): EquipmentMap<Armor> {

        const map: EquipmentMap<Armor> = {};

        for (const armorName in armors) {
            if (Object.prototype.hasOwnProperty.call(armors, armorName)) {
                map[ armorName ] = new Armor(armorName, armors[ armorName ]);
            }
        }

        return map;
    }

    private static createShieldArray(shields: EquipmentMap<Shield>): Shield[] {

        const shieldArray: Shield[] = [];

        for (const shieldName in shields) {
            if (Object.prototype.hasOwnProperty.call(shields, shieldName)) {
                shieldArray.push(shields[ shieldName ]);
            }
        }

        shieldArray.sort((a: Shield, b: Shield) => {
            return a.defense - b.defense;
        });

        return shieldArray;
    }

    private static createShieldMap(shields: Record<string, ShieldData>): EquipmentMap<Shield> {

        const map: EquipmentMap<Shield> = {};

        for (const shieldName in shields) {
            if (Object.prototype.hasOwnProperty.call(shields, shieldName)) {
                map[ shieldName ] = new Shield(shieldName, shields[ shieldName ]);
            }
        }
        return map;
    }

    private static createWeaponsArray(weapons: EquipmentMap<Weapon>): Weapon[] {

        const weaponArray: Weapon[] = [];

        for (const weaponName in weapons) {
            if (Object.prototype.hasOwnProperty.call(weapons, weaponName)) {
                weaponArray.push(weapons[ weaponName ]);
            }
        }

        weaponArray.sort((a: Weapon, b: Weapon) => {
            return a.power - b.power;
        });

        return weaponArray;
    }

    private static createWeaponsMap(weapons: Record<string, WeaponData>): EquipmentMap<Weapon> {

        const map: EquipmentMap<Weapon> = {};

        for (const weaponName in weapons) {
            if (Object.prototype.hasOwnProperty.call(weapons, weaponName)) {
                map[ weaponName ] = new Weapon(weaponName, weapons[ weaponName ]);
            }
        }
        return map;
    }

    override update(delta: number) {

        this.handleDefaultKeys();

        if (!this.assetsLoaded) {

            this.assetsLoaded = true;
            const game: DwGame = this.game;

            game.assets.addImage('title', 'res/title.png');
            game.assets.addSpriteSheet('hero', 'res/hero.png', 16, 16, 1, 1, true);
            game.assets.addSpriteSheet('npcs', 'res/npcs.png', 16, 16, 1, 1, true);
            game.assets.addImage('battleBG', 'res/battle_backgrounds.png');
            game.assets.addImage('font', 'res/font_8x10.png');
            void game.assets.addJson('enemies', 'res/enemies.json');
            void game.assets.addJson('enemyTerritories', 'res/enemyTerritories.json');
            game.assets.addCanvas('enemiesImage', 'res/monsters.png');
            void game.assets.addJson('enemyAtlas', 'res/enemyAtlas.json');
            void game.assets.addJson('tileset_tiles.json', 'res/maps/tileset_tiles.json');
            void game.assets.addJson('enemy_territory_tiles.json', 'res/maps/enemy_territory_tiles.json');
            void game.assets.addJson('collision_tiles.json', 'res/maps/collision_tiles.json');
            void game.assets.addJson('overworld.json', 'res/maps/overworld.json');
            void game.assets.addJson('equipment', 'res/equipment.json');
            void game.assets.addJson('brecconary.json', 'res/maps/brecconary.json');
            void game.assets.addJson('tantegelCastle.json', 'res/maps/tantegelCastle.json');
            void game.assets.addJson('erdricksCave1.json', 'res/maps/erdricksCave1.json');
            void game.assets.addJson('erdricksCave2.json', 'res/maps/erdricksCave2.json');
            void game.assets.addJson('garinham.json', 'res/maps/garinham.json');
            void game.assets.addSound('MUSIC_TITLE_SCREEN', 'res/sound/01 Dragon Quest 1 - Intro ~ Overture (22khz mono).ogg');
            void game.assets.addSound('MUSIC_TANTEGEL', 'res/sound/02 Dragon Quest 1 - Tantegel Castle (22khz mono).ogg');
            void game.assets.addSound('MUSIC_TANTEGEL_LOWER', 'res/sound/03 Dragon Quest 1 - Tantegel Castle (Lower) (22khz mono).ogg');
            void game.assets.addSound('MUSIC_TOWN', 'res/sound/04 Dragon Quest 1 - Peaceful Village (22khz mono).ogg');
            void game.assets.addSound('MUSIC_OVERWORLD', 'res/sound/05 Dragon Quest 1 - Kingdom of Alefgard (22khz mono).ogg');
            void game.assets.addSound('MUSIC_BATTLE', 'res/sound/14 Dragon Quest 1 - A Monster Draws Near (16khz mono).ogg', 2.32);
            void game.assets.addSound('MUSIC_DUNGEON_FLOOR_1', 'res/sound/06 Dragon Quest 1 - Dark Dungeon - Floor 1 (22khz mono).ogg');
            void game.assets.addSound('dead', 'res/sound/20 Dragon Quest 1 - Thou Hast Died (22khz mono).ogg');
            void game.assets.addSound('overnight', 'res/sound/21 Dragon Quest 1 - Special Item (22khz mono).ogg');
            void game.assets.addSound('victory', 'res/sound/25 Dragon Quest 1 - Victory (22khz mono).ogg', 0, false);
            void game.assets.addSound('stairs', 'res/sound/29 Dragon Quest 1 - Stairs Up (22khz mono).wav');
            void game.assets.addSound('run', 'res/sound/30 Dragon Quest 1 - Stairs Down (22khz mono).wav');
            void game.assets.addSound('menu', 'res/sound/32 Dragon Quest 1 - Menu Button (22khz mono).wav');
            void game.assets.addSound('confirmation', 'res/sound/33 Dragon Quest 1 - Confirmation (22khz mono).wav');
            void game.assets.addSound('hit', 'res/sound/34 Dragon Quest 1 - Hit (22khz mono).wav');
            void game.assets.addSound('excellentMove', 'res/sound/35 Dragon Quest 1 - Excellent Move (22khz mono).wav');
            void game.assets.addSound('attack', 'res/sound/36 Dragon Quest 1 - Attack (22khz mono).ogg');
            void game.assets.addSound('receiveDamage', 'res/sound/37 Dragon Quest 1 - Receive Damage (22khz mono).wav');
            void game.assets.addSound('prepareToAttack', 'res/sound/39 Dragon Quest 1 - Prepare to Attack (22khz mono).wav');
            void game.assets.addSound('missed1', 'res/sound/40 Dragon Quest 1 - Missed! (22khz mono).wav');
            void game.assets.addSound('missed2', 'res/sound/41 Dragon Quest 1 - Missed! (2) (22khz mono).wav');
            void game.assets.addSound('bump', 'res/sound/42 Dragon Quest 1 - Bumping into Walls (22khz mono).wav');
            void game.assets.addSound('castSpell', 'res/sound/43 Dragon Quest 1 - Cast A Spell (22khz mono).ogg');
            void game.assets.addSound('openChest', 'res/sound/44 Dragon Quest 1 - Open Treasure (22khz mono).ogg');
            void game.assets.addSound('door', 'res/sound/45 Dragon Quest 1 - Open Door (22khz mono).ogg');
            void game.assets.addSound('talk', 'res/sound/Dragon Warrior [Dragon Quest] SFX (1).wav');
            game.assets.onLoad(() => {

                // TODO: This could be done much, much more cleanly
                const enemyJson: ImageAtlasInfo = game.assets.get('enemyAtlas');
                const atlas: ImageAtlas = new ImageAtlas(game.assets.get('enemiesImage'), enemyJson);
                // delete game.assets.get('monsters');
                const images: ImageMap = atlas.parse(game.scale);
                for (const id in images) {
                    if (Object.prototype.hasOwnProperty.call(images, id)) {
                        game.assets.set(id, images[ id ]);
                    }
                }

                const equipment: EquipmentData = game.assets.get('equipment');
                const weaponsMap: EquipmentMap<Weapon> = LoadingState.createWeaponsMap(equipment.weapons);
                game.assets.set('weapons', weaponsMap);
                game.assets.set('weaponsArray', LoadingState.createWeaponsArray(weaponsMap));
                const armorMap: EquipmentMap<Armor> = LoadingState.createArmorMap(equipment.armor);
                game.assets.set('armor', armorMap);
                game.assets.set('armorArray', LoadingState.createArmorArray(armorMap));
                const shieldMap: EquipmentMap<Shield> = LoadingState.createShieldMap(equipment.shields);
                game.assets.set('shields', shieldMap);
                game.assets.set('shieldArray', LoadingState.createShieldArray(shieldMap));

                const font: Image = game.assets.get('font');
                game.assets.set('font', new BitmapFont(font, 8, 10, 8, 6, game.scale));

                game.assets.addTmxMap(game.initLoadedMap('overworld.json'));
                game.assets.addTmxMap(game.initLoadedMap('brecconary.json'));
                game.assets.addTmxMap(game.initLoadedMap('tantegelCastle.json'));
                game.assets.addTmxMap(game.initLoadedMap('erdricksCave1.json'));
                game.assets.addTmxMap(game.initLoadedMap('erdricksCave2.json'));
                game.assets.addTmxMap(game.initLoadedMap('garinham.json'));
                game.assets.onLoad(() => {
                    const skipTitle: string | null = Utils.getRequestParam('skipTitle');
                    if (skipTitle !== null) { // Allow empty strings
                        game.startNewGame();
                    } else {
                        game.setState(new FadeOutInState(this, new GameStudioAdvertState(this.game)));
                    }
                });
            });

        }

    }

    override render(ctx: CanvasRenderingContext2D) {

        const game: Game = this.game;
        game.clearScreen('rgb(0,0,255)');

        const str = 'Loading...';
        ctx.font = 'bold 30px Sans Serif';

        if (!this.textX || !this.textY) { // appease tsc
            const textMetrics: TextMetrics = ctx.measureText(str);
            this.textX = (game.getWidth() - textMetrics.width) / 2;
            const fontDescentGuess = 4;
            this.textY = (game.getHeight() - fontDescentGuess) / 2;
        }

        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillText(str, this.textX, this.textY);

    }
}
