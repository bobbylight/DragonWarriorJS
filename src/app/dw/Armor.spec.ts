import { describe, expect, it } from 'vitest';
import { Armor } from '@/app/dw/Armor';

describe('Armor', () => {
    const armor = new Armor('test', {
        name: 'test',
        displayName: 'displayName',
        baseCost: 10,
        defense: 4,
    });

    it('constructor populates fields properly', () => {
        expect(armor.name).toEqual('test');
        expect(armor.displayName).toEqual('displayName');
        expect(armor.baseCost).toEqual(10);
        expect(armor.defense).toEqual(4);
    });

    it('toString() works', () => {
        expect(armor.toString()).toEqual('[Armor: name=test, baseCost=10, defense=4]');
    });
});
