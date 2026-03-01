import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { DwGame } from '@/app/dw/DwGame';
import { ChoiceBubble } from '@/app/dw/ChoiceBubble';

const mockFont = {
    cellW: 8,
    cellH: 9,
};

// 3 choices: left column = indices 0-1, right column = index 2
const choices = [ 'Alpha', 'Beta', 'Gamma' ];
const leftCount = Math.ceil(choices.length / 2); // 2

describe('ChoiceBubble', () => {

    let game: DwGame;

    beforeEach(() => {
        game = new DwGame();
        game.assets.set('font', mockFont);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('selects the first choice by default', () => {
        const bubble = new ChoiceBubble(game, 0, 0, 100, 100, choices);
        expect(bubble.getSelectedIndex()).toEqual(0);
        expect(bubble.getSelectedItem()).toEqual('Alpha');
    });

    describe('handleInput() - single column', () => {

        let bubble: ChoiceBubble<string>;
        let upSpy: MockInstance;
        let downSpy: MockInstance;

        beforeEach(() => {
            bubble = new ChoiceBubble(game, 0, 0, 100, 100, choices);
            vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(false);
            vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
            upSpy = vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
            downSpy = vi.spyOn(game.inputManager, 'down').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'right').mockReturnValue(false);
        });

        it('returns false when no key is pressed', () => {
            expect(bubble.handleInput()).toEqual(false);
        });

        it('down moves to the next item', () => {
            downSpy.mockReturnValue(true);
            bubble.handleInput();
            expect(bubble.getSelectedIndex()).toEqual(1);
            expect(bubble.getSelectedItem()).toEqual('Beta');
        });

        it('down does not move past the last item', () => {
            downSpy.mockReturnValue(true);
            for (let i = 0; i < choices.length + 5; i++) {
                bubble.handleInput();
            }
            expect(bubble.getSelectedIndex()).toEqual(choices.length - 1);
        });

        it('up does not move past the first item', () => {
            upSpy.mockReturnValue(true);
            bubble.handleInput();
            expect(bubble.getSelectedIndex()).toEqual(0);
        });

        it('up moves to the previous item', () => {
            downSpy.mockReturnValue(true);
            bubble.handleInput(); // → index 1
            downSpy.mockReturnValue(false);
            upSpy.mockReturnValue(true);
            bubble.handleInput(); // → index 0
            expect(bubble.getSelectedIndex()).toEqual(0);
            expect(bubble.getSelectedItem()).toEqual('Alpha');
        });

        describe('action key', () => {

            beforeEach(() => {
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(true);
                vi.spyOn(game.audio, 'playSound').mockImplementation(() => {
                    return 1;
                });
            });

            it('returns true', () => {
                expect(bubble.handleInput()).toEqual(true);
            });

            it('keeps the current selection', () => {
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
                downSpy.mockReturnValue(true);
                bubble.handleInput(); // -> Beta
                downSpy.mockReturnValue(false);
                vi.spyOn(game, 'actionKeyPressed').mockReturnValue(true);
                bubble.handleInput(); // confirm
                expect(bubble.getSelectedItem()).toEqual('Beta');
            });
        });

        describe('cancel key - non-cancellable bubble', () => {

            beforeEach(() => {
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(true);
            });

            it('returns false', () => {
                expect(bubble.handleInput()).toEqual(false);
            });

            it('resets selection to 0', () => {
                downSpy.mockReturnValue(true);
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(false);
                bubble.handleInput(); // → Beta
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(true);
                downSpy.mockReturnValue(false);
                bubble.handleInput();
                expect(bubble.getSelectedIndex()).toEqual(0);
                expect(bubble.getSelectedItem()).toEqual('Alpha');
            });
        });

        describe('cancel key - cancellable bubble', () => {

            beforeEach(() => {
                bubble = new ChoiceBubble(game, 0, 0, 100, 100, choices, undefined, true);
                vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(true);
            });

            it('returns true', () => {
                expect(bubble.handleInput()).toEqual(true);
            });

            it('sets selected index to -1 and selected item to undefined', () => {
                bubble.handleInput();
                expect(bubble.getSelectedIndex()).toEqual(-1);
                expect(bubble.getSelectedItem()).toBeUndefined();
            });
        });
    });

    describe('handleInput() - 2-column layout', () => {

        let bubble: ChoiceBubble<string>;
        let upSpy: MockInstance;
        let downSpy: MockInstance;
        let leftSpy: MockInstance;
        let rightSpy: MockInstance;

        beforeEach(() => {
            bubble = new ChoiceBubble(game, 0, 0, 200, 100, choices, undefined, false, undefined, 2);
            vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(false);
            vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
            upSpy = vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
            downSpy = vi.spyOn(game.inputManager, 'down').mockReturnValue(false);
            leftSpy = vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
            rightSpy = vi.spyOn(game.inputManager, 'right').mockReturnValue(false);
        });

        it('down moves to the next item in the left column', () => {
            downSpy.mockReturnValue(true);
            bubble.handleInput();
            expect(bubble.getSelectedIndex()).toEqual(1);
            expect(bubble.getSelectedItem()).toEqual('Beta');
        });

        it('down does not move past the bottom of the left column', () => {
            downSpy.mockReturnValue(true);
            for (let i = 0; i < leftCount + 5; i++) {
                bubble.handleInput();
            }
            expect(bubble.getSelectedIndex()).toEqual(leftCount - 1);
        });

        it('up does not move past the top of the left column', () => {
            upSpy.mockReturnValue(true);
            bubble.handleInput();
            expect(bubble.getSelectedIndex()).toEqual(0);
        });

        it('right moves to the corresponding row in the right column', () => {
            rightSpy.mockReturnValue(true);
            bubble.handleInput();
            expect(bubble.getSelectedIndex()).toEqual(leftCount);
            expect(bubble.getSelectedItem()).toEqual('Gamma');
        });

        it('right clamps to the last item when the right column is shorter', () => {
            downSpy.mockReturnValue(true);
            bubble.handleInput(); // → index 1 (bottom of left column)
            downSpy.mockReturnValue(false);
            rightSpy.mockReturnValue(true);
            bubble.handleInput(); // right column only has index 2, so clamps there
            expect(bubble.getSelectedIndex()).toEqual(choices.length - 1);
            expect(bubble.getSelectedItem()).toEqual('Gamma');
        });

        it('right does nothing when already in the right column', () => {
            rightSpy.mockReturnValue(true);
            bubble.handleInput(); // → right column
            bubble.handleInput(); // should stay
            expect(bubble.getSelectedIndex()).toEqual(leftCount);
        });

        it('left from the right column returns to the same row in the left column', () => {
            rightSpy.mockReturnValue(true);
            bubble.handleInput(); // → index 2 (right column, row 0)
            rightSpy.mockReturnValue(false);
            leftSpy.mockReturnValue(true);
            bubble.handleInput(); // → index 0 (left column, row 0)
            expect(bubble.getSelectedIndex()).toEqual(0);
            expect(bubble.getSelectedItem()).toEqual('Alpha');
        });

        it('left does nothing when already in the left column', () => {
            leftSpy.mockReturnValue(true);
            bubble.handleInput();
            expect(bubble.getSelectedIndex()).toEqual(0);
        });

        it('down in the right column does not move past the last item', () => {
            rightSpy.mockReturnValue(true);
            bubble.handleInput(); // → right column
            rightSpy.mockReturnValue(false);
            downSpy.mockReturnValue(true);
            bubble.handleInput(); // attempt to go past end
            expect(bubble.getSelectedIndex()).toEqual(choices.length - 1);
        });
    });

    describe('reset()', () => {

        it('resets the selection to the first item', () => {
            const bubble = new ChoiceBubble(game, 0, 0, 100, 100, choices);
            vi.spyOn(game, 'cancelKeyPressed').mockReturnValue(false);
            vi.spyOn(game, 'actionKeyPressed').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'up').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'down').mockReturnValue(true);
            vi.spyOn(game.inputManager, 'left').mockReturnValue(false);
            vi.spyOn(game.inputManager, 'right').mockReturnValue(false);
            bubble.handleInput(); // → index 1

            bubble.reset();

            expect(bubble.getSelectedIndex()).toEqual(0);
            expect(bubble.getSelectedItem()).toEqual('Alpha');
        });
    });
});
