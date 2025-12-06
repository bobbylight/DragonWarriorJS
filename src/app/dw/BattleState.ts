import { Delay, Image, Utils } from 'gtp';
import { BaseState } from './BaseState';
import { DwGame } from './DwGame';
import { RoamingState } from './RoamingState';
import { DeadState } from './DeadState';
import { StatBubble } from './StatBubble';
import { Enemy } from './Enemy';
import { BattleCommandBubble } from './BattleCommandBubble';
import { TextBubble } from './TextBubble';
import { Conversation } from './Conversation';
import { EnemyAiResult } from './EnemyAI';

export class BattleState extends BaseState {

    private readonly enemyName: string;
    private readonly enemy: Enemy;
    private commandExecuting = false;
    private fightDelay?: Delay;
    private readonly textBubble: TextBubble;
    private readonly commandBubble: BattleCommandBubble;
    private readonly statBubble: StatBubble;
    private enemyFlashDelay?: Delay;
    private flashMillis = 0;
    private enemiesDead = false;
    private enemyAttackDelay?: Delay;
    private shake = false;
    private enemyAttackShakeDelay?: Delay;
    private shakeXOffs = 0;
    private shakeMillisCount = 0;
    private dead = false;

    constructor(game: DwGame, enemyName: string) {
        super(game);
        this.enemyName = enemyName;
        this.enemy = new Enemy(game, game.getEnemy(this.enemyName)).prepare();
        this.textBubble = new TextBubble(game);
        this.statBubble = new StatBubble(game);
        this.commandBubble = new BattleCommandBubble(game);
    }

    private backToRoaming() {
        this.game.audio.fadeOutMusic('MUSIC_OVERWORLD');
        this.game.setState(new RoamingState(this.game));
    }

    fight() {
        this.commandExecuting = true;
        this.fightDelay = new Delay({ millis: [ 300 ], callback: this.fightCallback.bind(this) });
        this.textBubble.addToConversation({ text: 'You attack!', sound: 'attack' }, true);
    }

    private fightCallback() {
        this.game.audio.playSound('hit');
        delete this.fightDelay;
        this.enemyFlashDelay = new Delay({ millis: 400, callback: this.enemyFlashCallback.bind(this) });
        this.flashMillis = 0;
    }

    private enemyFlashCallback() {

        delete this.enemyFlashDelay;

        const damage: number = this.game.hero.computePhysicalAttackDamage(this.enemy);
        const dead: boolean = this.enemy.takeDamage(damage);

        const text = `Direct hit! Thy enemy's hit points have been reduced by ${damage}.`;
        this.textBubble.addToConversation({ text: text }, true);

        if (dead) {
            this.defeatedEnemy();
        } else {
            this.enemyAttack();
        }
    }

    private defeatedEnemy() {

        const text = `
Thou hast defeated the ${this.enemy.name}.
Thy experience increases by ${this.enemy.xp}.
Thy gold increases by ${this.enemy.gp}.`;
        this.enemiesDead = true;

        this.game.hero.exp += this.enemy.xp;
        this.game.party.gold += this.enemy.gp;

        // TODO: Check for level up

        this.textBubble.addToConversation({ text: text, music: 'victory' });
        this.commandExecuting = false;
    }

    private enemyAttack() {

        const result: EnemyAiResult = this.enemy.ai(this.game.hero, this.enemy);

        if (result.type === 'physical') {
            const text = `The ${this.enemy.name} attacks!`;
            this.textBubble.addToConversation({ text, afterSound: 'prepareToAttack' }, true);
            this.textBubble.onDone(() => {
                this.enemyAttackDelay = new Delay({
                    millis: 350,
                    callback: this.enemyAttackCallback.bind(this),
                });
            });
        } else { // 'magic'
            const text = `The ${this.enemy.name} chants the spell of ${result.spellName}.`;
            // TODO: Should conversations auto-wait for afterSounds to complete?
            this.textBubble.addToConversation({ text, afterSound: 'castSpell' }, true);
            this.textBubble.onDone(() => {
                this.enemyAttackDelay = new Delay({
                    millis: 900,
                    callback: this.enemyAttackCallback.bind(this),
                });
            });
        }
    }

    private enemyAttackCallback() {
        delete this.enemyAttackDelay;
        this.shake = true;
        this.game.audio.playSound('receiveDamage');
        this.enemyAttackShakeDelay = new Delay({
            millis: 1000,
            callback: this.enemyAttackShakeCallback.bind(this),
        });

    }

    private enemyAttackShakeCallback() {

        delete this.enemyAttackShakeDelay;
        this.shake = false;

        const damage: number = this.enemy.ai(this.game.hero, this.enemy).damage;
        this.game.hero.takeDamage(damage);
        let text = `Thy Hit Points decreased by ${damage}.`;
        if (this.game.hero.isDead()) {
            text += '\nThou art dead.';
            this.textBubble.addToConversation({ text }, true);
            this.dead = true;
        } else {
            text += '\nCommand?';
            this.textBubble.addToConversation({ text }, true);
        }

        this.commandExecuting = false;
    }

    override enter() {

        super.enter();
        this.commandExecuting = false;
        const conversation: Conversation = new Conversation(this.game);
        conversation.addSegment({ text: 'A ' + this.enemy.name + ' draws near!  Command?' });
        this.textBubble.setConversation(conversation);
    }

    item() {
        this.textBubble.addToConversation({ text: 'Not implemented, command?' });
    }

    override render(ctx: CanvasRenderingContext2D) {

        const game: DwGame = this.game;

        if (this.shake) {
            game.setCameraOffset(this.shakeXOffs, 0);
        }
        game.drawMap(ctx);
        if (this.shake) {
            game.setCameraOffset(0, 0);
        }

        const width: number = game.getWidth();
        const height: number = game.getHeight();
        const tileSize: number = game.getTileSize();

        const battleBG: Image = game.assets.get('battleBG');
        let x: number = (width - battleBG.width) / 2;
        let y: number = (height - battleBG.height) / 2 - tileSize;
        battleBG.draw(ctx, x, y);

        if (this.enemy && !this.enemiesDead) {

            const flash: boolean = Math.round(this.flashMillis) % 40 > 20;
            const enemyImg: Image = this.enemy.getImage(flash);
            x = (width - enemyImg.width) / 2;
            y += battleBG.height - tileSize / 2 - enemyImg.height;
            enemyImg.draw(ctx, x, y);

            if (!this.commandExecuting) {
                if (this.textBubble?.isDone()) {
                    this.commandBubble.paint(ctx);
                }
            }
            if (this.statBubble) {
                this.statBubble.paint(ctx);
            }
            if (this.textBubble) {
                this.textBubble.paint(ctx);
            }

        } else if (this.enemiesDead) {
            if (this.statBubble) {
                this.statBubble.paint(ctx);
            }
            if (this.textBubble) {
                this.textBubble.paint(ctx);
            }
        }

    }

    run() {

        const game: DwGame = this.game;

        this.commandExecuting = true;
        this.fightDelay = new Delay({ millis: [ 600 ], callback: this.runCallback.bind(this) });
        game.audio.playSound('run');
        this.textBubble.addToConversation({ text: game.hero.name + ' started to run away.' }, true);
    }

    private runCallback() {
        delete this.fightDelay;
        const temp: number = Utils.randomInt(2);
        const success: boolean = temp === 1;
        if (success) {
            this.commandExecuting = false;
            this.backToRoaming();
        } else {
            this.commandExecuting = false;
            this.commandBubble.reset();
            this.commandBubble.init();
            this.textBubble.addToConversation({ text: 'Couldn\'t run!' });
        }
    }

    override update(delta: number) {

        const game: DwGame = this.game;

        if (this.dead && this.textBubble.isDone()) {
            game.setState(new DeadState(game, this));
            return;
        }

        this.statBubble.update(delta);
        this.commandBubble.update(delta);

        this.handleDefaultKeys();

        if (this.enemiesDead && this.textBubble.isDone()) {
            if (game.anyKeyDown()) {
                this.backToRoaming();
                return;
            }
        }

        if (this.fightDelay) {
            this.fightDelay.update(delta);
        }
        if (this.enemyFlashDelay) {
            this.flashMillis += delta;
            this.enemyFlashDelay.update(delta);
        } else if (this.enemyAttackDelay) {
            this.enemyAttackDelay.update(delta);
        } else if (this.enemyAttackShakeDelay) {
            this.enemyAttackShakeDelay.update(delta);
            this.shakeMillisCount += delta;
            this.shakeXOffs = this.shakeMillisCount % 100 > 50 ? 4 : -4;
            console.log(delta);
        }

        if (!this.textBubble.isDone()) {
            this.textBubble.handleInput();
            this.textBubble.update(delta);
        } else if (!this.commandExecuting && this.commandBubble.handleInput()) {
            this.commandBubble.handleCommandChosen(this);
        }

    }
}
