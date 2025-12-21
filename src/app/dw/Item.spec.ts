import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getItemByName, HERB, KEY, TORCH } from '@/app/dw/Item';
import { RoamingState } from '@/app/dw/RoamingState';
import { DwGame } from '@/app/dw/DwGame';
import { DwMap } from '@/app/dw/DwMap';

const mockFont = {
    cellW: 8,
    cellH: 9,
};

const mockOverworldMap = {
    npcs: [],
    getProperty: () => null,
};

const mockCaveMap = {
    npcs: [],
    getProperty: () => true,
};

describe('Item', () => {
    let roamingState: RoamingState;

    beforeEach(() => {
        const game = new DwGame();
        game.assets.set('font', mockFont);
        game.assets.set('overworld', mockOverworldMap);
        game.maps.overworld = mockOverworldMap as unknown as DwMap;
        game.assets.set('cave', mockCaveMap);
        game.maps.cave = mockCaveMap as unknown as DwMap;
        roamingState = new RoamingState(game);
    });

    afterEach(() => {
        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    it('toString() works', () => {
        expect(HERB.toString()).toEqual('[Item: name=Herb]');
    });

    describe('Herb', () => {
        it('costs 24 gold', () => {
            expect(HERB.baseCost).toEqual(24);
        });

        it('use() works', () => {
            const spy = vi.spyOn(roamingState, 'showOneLineConversation').mockImplementation(() => {});
            const incHpSpy = vi.spyOn(roamingState.game.hero, 'incHp').mockImplementation(() => true);
            expect(HERB.use(roamingState)).toEqual(true);
            expect(spy).toHaveBeenCalledExactlyOnceWith(false, '\\w{hero.name} used the Herb.');
            expect(incHpSpy).toHaveBeenCalledOnce();
        });
    });

    describe('Key', () => {
        it('costs 53 gold', () => {
            expect(KEY.baseCost).toEqual(53);
        });

        it('use() works', () => {
            const spy = vi.spyOn(roamingState, 'openDoor').mockImplementation(() => true);
            expect(KEY.use(roamingState)).toEqual(true);
            expect(spy).toHaveBeenCalledExactlyOnceWith();
        });
    });

    describe('Torch', () => {
        it('costs 8 gold', () => {
            expect(TORCH.baseCost).toEqual(8);
        });

        describe('use()', () => {
            describe('when the map does not require a torch', () => {
                beforeEach(() => {
                    roamingState.game.setMap('overworld');
                });

                it('works', () => {
                    const spy = vi.spyOn(roamingState, 'showOneLineConversation').mockImplementation(() => {});
                    expect(TORCH.use(roamingState)).toEqual(false);
                    expect(spy).toHaveBeenCalledExactlyOnceWith(false, 'A torch can be used only in dark places.');
                });
            });

            describe('when the map does require a torch', () => {
                beforeEach(() => {
                    roamingState.game.setMap('cave');
                });

                it('works', () => {
                    const spy = vi.spyOn(roamingState, 'showOneLineConversation').mockImplementation(() => {});
                    const setUsingTorchSpy = vi.spyOn(roamingState.game, 'setUsingTorch');
                    expect(TORCH.use(roamingState)).toEqual(true);
                    expect(spy).not.toHaveBeenCalled();
                    expect(setUsingTorchSpy).toHaveBeenCalledExactlyOnceWith(true);
                });
            });
        });
    });

    describe('getItemByName()', () => {
        it('works', () => {
            expect(getItemByName('Herb')).toEqual(HERB);
            expect(getItemByName('Magic Key')).toEqual(KEY);
            expect(getItemByName('Torch')).toEqual(TORCH);
        });

        it('returns undefined for unknown items', () => {
            expect(getItemByName('unknown')).toBeUndefined();
        });
    });
});
