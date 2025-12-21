import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DwGame } from '@/app/dw/DwGame';
import { TextBubble } from '@/app/dw/TextBubble';
import { Conversation } from '@/app/dw/Conversation';

const mockFont = {
    cellW: 8,
    cellH: 9,
};

describe('TextBubble', () => {
    let game: DwGame;
    let bubble: TextBubble;

    beforeEach(() => {
        game = new DwGame();
        game.assets.set('font', mockFont);
        bubble = new TextBubble(game);
    });

    describe('when no text has been added', () => {
        it('is done', () => {
            expect(bubble.isDone()).toEqual(true);
        });
    });

    describe('setConversation()', () => {
        const content = 'Hello world!';

        beforeEach(() => {
            const conversation = new Conversation(game);
            conversation.addSegment(content);
            bubble.setConversation(conversation);
        });

        it('is not considered done', () => {
            expect(bubble.isDone()).toEqual(false);
        });

        describe('when a button is pressed', () => {
            describe('and there is no additional segments of content', () => {
                beforeEach(() => {
                    vi.spyOn(game, 'anyKeyDown').mockReturnValue(true);
                    bubble.handleInput();
                });

                it('is considered done', () => {
                    expect(bubble.isDone()).toEqual(true);
                });

                it('returns true after the next handleInput() to denote the conversation is done', () => {
                    expect(bubble.handleInput()).toEqual(true);
                });
            });

            describe('and there are no additional segments of content', () => {
                beforeEach(() => {
                    bubble.addToConversation('Second line');
                    vi.spyOn(game, 'anyKeyDown').mockReturnValue(true);
                    bubble.handleInput();
                });

                it('is not considered done', () => {
                    expect(bubble.isDone()).toEqual(false);
                });

                it('returns true after the next handleInput() to denote the conversation is done', () => {
                    expect(bubble.handleInput()).toEqual(false);
                });
            });
        });
    });
});
