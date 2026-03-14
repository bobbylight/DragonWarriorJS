import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { AudioSystem, Utils } from 'gtp';
import { DwGame } from '@/app/dw/DwGame';
import { BattleState } from '@/app/dw/BattleState';
import { EnemyData } from '@/app/dw/Enemy';
import { EnemyAiFunc } from '@/app/dw/EnemyAI';
import { TextBubble } from '@/app/dw/TextBubble';

const mockFont = {
    cellW: 8,
    cellH: 9,
};

const slimeData: EnemyData = {
    name: 'Slime',
    image: 'slime',
    damagedImage: 'slimedamaged',
    str: 3,
    agility: 2,
    hp: 3,
    resist: {},
    dodge: 0,
    xp: 1,
    gp: 1,
    ai: 'attackOnly',
};

describe('BattleState', () => {
    let game: DwGame;
    let battleState: BattleState;
    let playSoundSpy: MockInstance<AudioSystem['playSound']>;

    beforeEach(() => {
        game = new DwGame();
        game.assets.set('font', mockFont);
        game.assets.set('enemies', { slime: slimeData });
        playSoundSpy = vi.spyOn(game.audio, 'playSound');
        battleState = new BattleState(game, 'slime');
        battleState.enter();
    });

    afterEach(() => {
        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    describe('enemyAttack() with fire', () => {
        let addToConversationSpy: MockInstance<TextBubble['addToConversation']>;

        beforeEach(() => {
            const textBubble = battleState.getTextBubble();
            vi.spyOn(textBubble, 'onDone').mockImplementation((cb: () => void) => {
                cb();
            });
            addToConversationSpy = vi.spyOn(textBubble, 'addToConversation');

            const enemy = battleState.getEnemy();
            // Ensure enemy survives the hero's attack so the enemy gets a turn
            vi.spyOn(enemy, 'takeDamage').mockReturnValue(false);
            vi.spyOn(enemy, 'ai').mockReturnValue({
                type: 'fire',
                damage: 10,
            });

            battleState.fight();
            battleState.update(400); // advance past 300ms fight delay
            battleState.update(500); // advance past 400ms flash delay
        });

        it('prints that the enemy is breathing fire', () => {
            expect(addToConversationSpy).toHaveBeenCalledWith(
                { text: 'The Slime is breathing fire.', afterSound: 'breatheFire' }, true,
            );
        });

        it('advances to enemyAttackCallback after a 600ms delay', () => {
            battleState.update(700); // advance past the 600ms fire delay
            expect(playSoundSpy).toHaveBeenCalledWith('receiveDamage');
        });
    });

    describe('run()', () => {
        describe('when the run attempt fails', () => {
            let enemyAiSpy: MockInstance<EnemyAiFunc>;
            let addToConversationSpy: MockInstance<TextBubble['addToConversation']>;

            beforeEach(() => {
                // randomInt returns 0; runCallback treats 1 as success, 0 as failure
                vi.spyOn(Utils, 'randomInt').mockReturnValue(0);

                // Fire onDone callbacks immediately so the test doesn't depend on
                // animation timing (the Bubble opening animation delays updateImpl).
                const textBubble = battleState.getTextBubble();
                vi.spyOn(textBubble, 'onDone').mockImplementation((cb: () => void) => {
                    cb();
                });

                addToConversationSpy = vi.spyOn(textBubble, 'addToConversation');

                // enemyAttack() is a private method, but we can tell it was called because the enemy's AI is run
                enemyAiSpy = vi.spyOn(battleState.getEnemy(), 'ai').mockImplementation(() => {
                    return {
                        type: 'physical',
                        damage: 3,
                    };
                });

                battleState.run();
                battleState.update(700); // advance past the 600ms run delay
            });

            it('prints that the hero runs away', () => {
                expect(addToConversationSpy).toHaveBeenCalledWith(
                    { text: 'Erdrick started to run away.' }, true,
                );
                expect(playSoundSpy).toHaveBeenCalledWith('run');
            });

            it('plays the run sound effect', () => {
                expect(playSoundSpy).toHaveBeenCalledWith('run');
            });

            it('prints that the hero failed to run away', () => {
                expect(addToConversationSpy).toHaveBeenCalledWith({ text: "Couldn't run!" });
                expect(playSoundSpy).toHaveBeenCalledWith('run');
            });

            it('gives the enemy a turn to attack', () => {
                expect(enemyAiSpy).toHaveBeenCalledOnce();
            });
        });
    });
});
