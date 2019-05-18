import { ImageUtils, InputManager, Keys, State } from 'gtp';
import Direction from './Direction';
import DwGame from './DwGame';

/**
 * Functionality common amongst all states in this game.
 */
export class _BaseState extends State {

    constructor(args: any) {
        super(args);
    }

    createScreenshot() {
        var canvas = ImageUtils.createCanvas(this.game.getWidth(), this.game.getHeight());
        var ctx = canvas.getContext('2d');
        this.render(ctx);
        return canvas;
    }

    _warpTo(mapName: string, row: number, col: number, desc: string, dir: number = Direction.SOUTH) {
        const game: DwGame = this.game as DwGame;
        game.loadMap(mapName, row, col, dir);
        game.setStatusMessage(`Warping to ${desc}...`);
    }

    handleDefaultKeys() {

        const im: InputManager = this.game.inputManager;
        const canvas: HTMLCanvasElement = this.game.canvas;
        const game: DwGame = this.game as DwGame;

        // Debugging actions
        if (im.shift()) {

            // Increase canvas size
            if (im.isKeyDown(Keys.KEY_P, true)) {
                if (!canvas.style.width) {
                    canvas.style.width = canvas.width + 'px';
                }
                if (!canvas.style.height) {
                    canvas.style.height = canvas.height + 'px';
                }
                canvas.style.width = (parseInt(canvas.style.width.substring(0, canvas.style.width.length - 2), 10) + 1) + 'px';
                canvas.style.height = (parseInt(canvas.style.height.substring(0, canvas.style.height.length - 2), 10) + 1) + 'px';
                game.setStatusMessage('Canvas size now: (' + canvas.style.width + ', ' + canvas.style.height + ')');
            }

            // Decrease canvas size
            else if (im.isKeyDown(Keys.KEY_L, true)) {
                if (!canvas.style.width) {
                    canvas.style.width = canvas.width + 'px';
                }
                if (!canvas.style.height) {
                    canvas.style.height = canvas.height + 'px';
                }
                canvas.style.width = (parseInt(canvas.style.width.substring(0, canvas.style.width.length - 2), 10) - 1) + 'px';
                canvas.style.height = (parseInt(canvas.style.height.substring(0, canvas.style.height.length - 2), 10) - 1) + 'px';
                game.setStatusMessage('Canvas size now: (' + canvas.style.width + ', ' + canvas.style.height + ')');
            }

            // Warps
            else if (im.isKeyDown(Keys[ '1' ], true)) {
                this._warpTo('brecconary', 15, 2, 'Brecconary', Direction.EAST);
            } else if (im.isKeyDown(Keys[ '2' ], true)) {
                this._warpTo('tantegelCastle', 15, 7, 'Tantegel Castle', Direction.WEST);
            } else if (im.isKeyDown(Keys[ '3' ], true)) {
                this._warpTo('tantegelCastle', 51, 11, 'the King at Tantegel Castle', Direction.WEST);
            } else if (im.isKeyDown(Keys[ '4' ], true)) {
                this._warpTo('erdricksCave1', 1, 1, "Erdrick's Cave");
            } else if (im.isKeyDown(Keys[ '5' ], true)) {
                this._warpTo('overworld', 51, 41, "Outside Tantegel Castle");
            } else if (im.isKeyDown(Keys[ '6' ], true)) {
                this._warpTo('erdricksCave1', 1, 1, "Erdrick's Cave");
            }

            // Audio stuff
            else if (im.isKeyDown(Keys.KEY_M, true)) {
                game.toggleMuted();
            }

            // Equipment testing
            else if (im.isKeyDown(Keys.KEY_W, true)) {
                game.cycleWeapon();
            } else if (im.isKeyDown(Keys.KEY_A, true)) {
                game.cycleArmor();
            } else if (im.isKeyDown(Keys.KEY_S, true)) {
                game.cycleShield();
            }

            // Stat testing
            else if (im.isKeyDown(Keys.KEY_H, true)) {
                if (im.ctrl()) {
                    game.setHeroStats(1, 1);
                } else {
                    game.setHeroStats(255, 255);
                }
            } else if (im.isKeyDown(Keys.KEY_K, true)) {
                if (im.ctrl()) {
                    game.setHeroStats(null, null, 0, 0);
                } else {
                    game.setHeroStats(null, null, 255, 255);
                }
            } else if (im.isKeyDown(Keys.KEY_T, true)) {
                game.setUsingTorch(!game.getUsingTorch());
            }

            // Options generally useful for debugging
            else if (im.isKeyDown(Keys.KEY_U, true)) {
                game.hero.setMoveIncrement(4);
                game.setStatusMessage('Hero speed === 4');
            } else if (im.isKeyDown(Keys.KEY_D, true)) {
                game.hero.setMoveIncrement(2);
                game.setStatusMessage('Hero speed === 2');
            } else if (im.isKeyDown(Keys.KEY_E, true)) {
                game.toggleRandomEncounters();
            }
        }

    }
}
