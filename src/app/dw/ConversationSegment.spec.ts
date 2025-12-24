import { beforeEach, describe, expect, it } from 'vitest';
import { DwGame } from '@/app/dw/DwGame';
import { Conversation } from '@/app/dw/Conversation';
import { ConversationSegment } from '@/app/dw/ConversationSegment';

describe('ConversationSegment', () => {
    let game: DwGame;
    let conversation: Conversation;

    beforeEach(() => {
        game = new DwGame();
        conversation = new Conversation(game, false);
    });

    describe('currentText()', () => {
        it('returns undefined for undefined', () => {
            const segment = new ConversationSegment(conversation, game, {});
            expect(segment.currentText()).toBeUndefined();
        });

        it('returns empty string for empty string', () => {
            const segment = new ConversationSegment(conversation, game, { text: '' });
            expect(segment.currentText()).toEqual('');
        });

        it('passes through plain text as-is', () => {
            const segment = new ConversationSegment(conversation, game, {
                text: 'Hello world!',
            });
            expect(segment.currentText()).toEqual('Hello world!');
        });

        it('token replaces the hero name', () => {
            const segment = new ConversationSegment(conversation, game, {
                text: 'Welcome, \\w{hero.name}.',
            });
            expect(segment.currentText()).toEqual('Welcome, Erdrick.');
        });

        it('token replaces the hero remaining experience', () => {
            const segment = new ConversationSegment(conversation, game, {
                text: 'XP remaining to next level is \\w{hero.expRemaining}.',
            });
            expect(segment.currentText()).toEqual('XP remaining to next level is 12345.');
        });

        it('token replaces the item name', () => {
            conversation.item = {
                name: 'club',
                baseCost: 10,
                displayName: 'Club',
            };
            const segment = new ConversationSegment(conversation, game, {
                text: 'The item is a \\w{item.name}.',
            });
            expect(segment.currentText()).toEqual('The item is a Club.');
        });

        it('token replaces the item base cost', () => {
            conversation.item = {
                name: 'club',
                baseCost: 10,
                displayName: 'Club',
            };
            const segment = new ConversationSegment(conversation, game, {
                text: 'The item cost is \\w{item.baseCost} gold.',
            });
            expect(segment.currentText()).toEqual('The item cost is 10 gold.');
        });

        it('skips over unknown token replacements', () => {
            const segment = new ConversationSegment(conversation, game, {
                text: 'This \\w{unknownToken} is not replaced.',
            });
            expect(segment.currentText()).toEqual('This \\w{unknownToken} is not replaced.');
        });

        it('replaces multiple tokens', () => {
            conversation.item = {
                name: 'club',
                baseCost: 10,
                displayName: 'Club',
            };
            const segment = new ConversationSegment(conversation, game, {
                text: 'The \\w{item.name} costs \\w{item.baseCost} gold.',
            });
            expect(segment.currentText()).toEqual('The Club costs 10 gold.');
        });
    });
});
