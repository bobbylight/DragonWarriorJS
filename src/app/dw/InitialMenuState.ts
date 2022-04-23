import { _BaseState } from './_BaseState';
import DwGame from './DwGame';
import Sounds from './Sounds';
import ChoiceBubble from './ChoiceBubble';

type Substate = 'mainMenu' | 'saveSelect';

/**
 * The initial menu shown to the user, after pressing Enter on the title screen.
 */
export class InitialMenuState extends _BaseState {

    private menuBubble: ChoiceBubble<string>;
    private saveSelectBubble: ChoiceBubble<string> | undefined;
    private substate: Substate;

    constructor(args?: any) {
        super(args);
    }

    private createMenuBubble(): ChoiceBubble<string> {

        const game: DwGame = this.game;
        const tileSize: number = game.getTileSize();
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = 7 * tileSize;
        const x: number = (game.getWidth() - w) / 2;
        const y: number = (game.getHeight() - h) / 2;

        const choices: string[] = [
            'CONTINUE A QUEST',
            'CHANGE MESSAGE SPEED',
            'BEGIN A NEW QUEST',
            'COPY A QUEST',
            'ERASE A QUEST',
        ]

        return new ChoiceBubble(x, y, w, h, choices);
    }

    private createSaveSelectBubble(): ChoiceBubble<string> {

        if (this.saveSelectBubble) {
            this.saveSelectBubble.reset();
            return this.saveSelectBubble;
        }

        const game: DwGame = this.game;
        const tileSize: number = game.getTileSize();
        const w: number = game.getWidth() - 4 * tileSize;
        const h: number = 2 * tileSize;
        const x: number = (game.getWidth() - w) / 2 + tileSize;
        const y: number = (game.getHeight() - h) / 2;

        const choices: string[] = [
            'ADVENTURE LOG 1: Test',
        ];
        return new ChoiceBubble(x,  y, w, h, choices, undefined, true);
    }

    enter(game: DwGame) {
        super.enter(game);
        this.menuBubble = this.createMenuBubble();
        this.substate = 'mainMenu';
        game.audio.playMusic(Sounds.MUSIC_TOWN);
    }

    leaving(game: DwGame) {
    }

    update(delta: number) {

        this.handleDefaultKeys();

        switch (this.substate) {

            default:
            case 'mainMenu':
                this.menuBubble.update(delta);
                if (this.menuBubble.handleInput()) {
                    const selection: number = this.menuBubble.getSelectedIndex();
                    if (0 === selection) { // Continue a game
                        this.game.audio.playSound('menu');
                        this.substate = 'saveSelect';
                        this.menuBubble.setActive(false);
                        this.saveSelectBubble = this.createSaveSelectBubble();
                    }
                    else { // Nothing else is implemented
                        this.game.audio.playSound('missed1');
                    }
                }
                break;

            case 'saveSelect':
                this.saveSelectBubble!.update(delta);
                if (this.saveSelectBubble!.handleInput()) {
                    const selection: number = this.saveSelectBubble!.getSelectedIndex();
                    if (-1 === selection) {
                        this.substate = 'mainMenu';
                        this.menuBubble.setActive(true);
                    }
                    else {
                        // For now there's only one selectable game
                        this.game.audio.playSound('menu');
                        this.game.startNewGame();
                    }
                }
                break;
        }
    }

    render(ctx: CanvasRenderingContext2D) {

        const game: DwGame = this.game;
        game.clearScreen();
        const w: number = game.getWidth();

        this.menuBubble.paint(ctx);

        if (this.substate === 'saveSelect') {
            this.saveSelectBubble!.paint(ctx);
        }
    }
}
