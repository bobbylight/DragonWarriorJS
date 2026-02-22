import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DwGame } from '@/app/dw/DwGame';
import {
    AdventureLog,
    createNewAdventureLog,
    getAdventureLogSummaries,
    loadAdventureLog,
    saveAdventureLog,
} from '@/app/dw/AdventureLog';

const mockWeapons = { club: { name: 'club' }, bambooStick: { name: 'bambooStick' } };
const mockArmor = { clothes: { name: 'clothes' }, leather: { name: 'leather' } };
const mockShields = { smallShield: { name: 'smallShield' }, largeShield: { name: 'largeShield' } };

describe('DwGame', () => {
    let game: DwGame;

    beforeEach(() => {
        game = new DwGame();
        game.assets.set('weapons', mockWeapons);
        game.assets.set('armor', mockArmor);
        game.assets.set('shields', mockShields);
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('loadAdventureLog()', () => {
        describe('when called with no ID', () => {
            beforeEach(() => {
                game.loadAdventureLog();
            });

            it('initializes hero stats to defaults', () => {
                expect(game.hero.hp).toBe(15);
                expect(game.hero.maxHp).toBe(15);
                expect(game.hero.level).toBe(1);
                expect(game.hero.exp).toBe(0);
                expect(game.hero.strength).toBe(4);
                expect(game.hero.agility).toBe(4);
            });

            it('initializes party gold from the log', () => {
                expect(game.party.gold).toBe(120);
            });

            it('initializes party inventory from the log', () => {
                expect(game.party.getInventory().getSize()).toBe(6);
            });

            it('does not save to localStorage', () => {
                expect(localStorage.length).toBe(0);
            });
        });

        describe('when called with an ID that exists in localStorage', () => {
            let storedLog: AdventureLog;

            beforeEach(() => {
                storedLog = createNewAdventureLog();
                storedLog.hero.hp = 8;
                storedLog.hero.maxHp = 20;
                storedLog.hero.mp = 9;
                storedLog.hero.maxMp = 21;
                storedLog.hero.level = 3;
                storedLog.hero.exp = 450;
                storedLog.hero.strength = 10;
                storedLog.hero.agility = 11;
                storedLog.party.gold = 500;
                storedLog.party.inventory = [ 'Herb', 'Torch' ];
                saveAdventureLog(storedLog);

                game.loadAdventureLog(storedLog.id);
            });

            it('restores hero HP and MP from the stored log', () => {
                expect(game.hero.hp).toBe(8);
                expect(game.hero.maxHp).toBe(20);
                expect(game.hero.mp).toBe(9);
                expect(game.hero.maxMp).toBe(21);
            });

            it('restores hero level and exp from the stored log', () => {
                expect(game.hero.level).toBe(3);
                expect(game.hero.exp).toBe(450);
            });

            it('restores hero stats from the stored log', () => {
                expect(game.hero.strength).toBe(10);
                expect(game.hero.agility).toBe(11);
            });

            it('restores party gold from the stored log', () => {
                expect(game.party.gold).toBe(500);
            });

            it('restores party inventory from the stored log', () => {
                const items = game.party.getInventory().getItems();
                expect(items).toHaveLength(2);
                expect(items[0].name).toBe('Herb');
                expect(items[1].name).toBe('Torch');
            });
        });

        describe('when called with an ID that does not exist in localStorage', () => {
            beforeEach(() => {
                game.loadAdventureLog('nonexistent-uuid');
            });

            it('falls back to a new adventure log', () => {
                expect(game.hero.hp).toBe(15);
                expect(game.hero.level).toBe(1);
            });
        });
    });

    describe('saveAdventureLog()', () => {
        beforeEach(() => {
            game.loadAdventureLog();
        });

        it('persists current hero stats into the log', () => {
            game.hero.hp = 7;
            game.hero.maxHp = 22;
            game.hero.mp = 10;
            game.hero.maxMp = 20;
            game.hero.level = 4;
            game.hero.exp = 800;
            game.saveAdventureLog();

            const log = loadAdventureLog(game.getAdventureLog().id);
            expect(log.hero.hp).toBe(7);
            expect(log.hero.maxHp).toBe(22);
            expect(log.hero.mp).toBe(10);
            expect(log.hero.maxMp).toBe(20);
            expect(log.hero.level).toBe(4);
            expect(log.hero.exp).toBe(800);
        });

        it('persists current party gold into the log', () => {
            game.party.gold = 999;
            game.saveAdventureLog();
            expect(loadAdventureLog(game.getAdventureLog().id).party.gold).toBe(999);
        });

        it('updates modifiedAt on every save', () => {
            vi.useFakeTimers();
            game.saveAdventureLog();
            const firstModifiedAt = loadAdventureLog(game.getAdventureLog().id).modifiedAt;

            vi.advanceTimersByTime(1000);
            game.saveAdventureLog();
            expect(loadAdventureLog(game.getAdventureLog().id).modifiedAt).not.toBe(firstModifiedAt);
            vi.useRealTimers();
        });

        it('adds an entry to the adventure log index', () => {
            game.saveAdventureLog();
            const summaries = getAdventureLogSummaries();
            expect(summaries).toHaveLength(1);
            expect(summaries[0].id).toBe(game.getAdventureLog().id);
        });

        it('updates the existing index entry rather than duplicating it', () => {
            game.saveAdventureLog();
            game.hero.level = 2;
            game.saveAdventureLog();

            const summaries = getAdventureLogSummaries();
            expect(summaries).toHaveLength(1);
            expect(summaries[0].level).toBe(2);
        });

        it('accumulates entries for distinct adventure logs', () => {
            game.saveAdventureLog();

            const game2 = new DwGame();
            game2.assets.set('weapons', mockWeapons);
            game2.assets.set('armor', mockArmor);
            game2.assets.set('shields', mockShields);
            game2.loadAdventureLog();
            game2.saveAdventureLog();

            expect(getAdventureLogSummaries()).toHaveLength(2);
        });
    });
});
