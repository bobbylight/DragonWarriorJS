import { beforeEach, describe, expect, it } from 'vitest';
import { SpellBubble } from '@/app/dw/SpellBubble';
import { healSpell } from '@/app/dw/Spell';
import { DwGame } from '@/app/dw/DwGame';

const mockFont = {
    cellW: 8,
    cellH: 9,
};

describe('SpellBubble', () => {
    let game: DwGame;

    beforeEach(() => {
        game = new DwGame();
        game.assets.set('font', mockFont);
    });

    it('initializes properly', () => {
        const bubble = new SpellBubble(game);
        expect(bubble.getSelectedIndex()).toEqual(0);
        expect(bubble.getSelectedItem()).toEqual(healSpell);
    });
});
