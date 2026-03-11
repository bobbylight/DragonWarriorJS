import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    AdventureLog,
    AdventureLogSummary,
    createNewAdventureLog,
    getAdventureLogSummaries,
    loadAdventureLog,
    saveAdventureLog,
} from '@/app/dw/AdventureLog';
import { Direction } from '@/app/dw/Direction';

const expectAdventureLogisForNewGame = (log: AdventureLog) => {
    expect(log.version).toBe(1);
    expect(log.hero.name).toBe('Erdrick');
    expect(log.hero.hp).toBe(15);
    expect(log.hero.maxHp).toBe(15);
    expect(log.hero.mp).toBe(15);
    expect(log.hero.maxMp).toBe(15);
    expect(log.hero.level).toBe(1);
    expect(log.hero.exp).toBe(0);
    expect(log.hero.strength).toBe(4);
    expect(log.hero.agility).toBe(4);
    expect(log.hero.sword).toBe('club');
    expect(log.hero.armor).toBe('clothes');
    expect(log.hero.shield).toBe('smallShield');
    expect(log.hero.map).toBe('brecconary');
    expect(log.hero.row).toBe(7);
    expect(log.hero.col).toBe(6);
    expect(log.hero.direction).toBe(Direction.SOUTH);
    expect(log.party.gold).toBe(120);
    expect(log.party.inventory.length).toEqual(6);
    expect(log.savedGwaelin).toBe(false);
};

describe('AdventureLog', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('createNewAdventureLog()', () => {
        it('generates a unique ID for each log', () => {
            const log1 = createNewAdventureLog();
            const log2 = createNewAdventureLog();
            expect(log1.id).not.toBe(log2.id);
        });

        it('sets version to 1', () => {
            expect(createNewAdventureLog().version).toBe(1);
        });

        it('sets createdAt and modifiedAt to the same ISO string', () => {
            const log = createNewAdventureLog();
            expect(log.createdAt).toBe(log.modifiedAt);
            expect(() => new Date(log.createdAt)).not.toThrow();
        });

        it('initializes hero at the default starting position', () => {
            const { hero } = createNewAdventureLog();
            expect(hero.name).toBe('Erdrick');
            expect(hero.hp).toBe(15);
            expect(hero.maxHp).toBe(15);
            expect(hero.mp).toBe(15);
            expect(hero.maxMp).toBe(15);
            expect(hero.level).toBe(1);
            expect(hero.exp).toBe(0);
            expect(hero.strength).toBe(4);
            expect(hero.agility).toBe(4);
            expect(hero.sword).toBe('club');
            expect(hero.armor).toBe('clothes');
            expect(hero.shield).toBe('smallShield');
            expect(hero.map).toBe('brecconary');
            expect(hero.row).toBe(7);
            expect(hero.col).toBe(6);
            expect(hero.direction).toBe(Direction.SOUTH);
        });

        it('initializes party properties properly', () => {
            const { party } = createNewAdventureLog();
            expect(party.inventory.length).toEqual(6);
            expect(party.gold).toBe(120);
        });

        it('initializes savedGwaelin to false', () => {
            expect(createNewAdventureLog().savedGwaelin).toBe(false);
        });

        it('initializes empty map states for all maps', () => {
            const { mapStates } = createNewAdventureLog();
            for (const mapName of [ 'brecconary', 'garinham', 'overworld', 'tantegelCastle' ]) {
                expect(mapStates[mapName].obtainedHiddenItems).toEqual([]);
                expect(mapStates[mapName].openedChests).toEqual([]);
                expect(mapStates[mapName].unlockedDoors).toEqual([]);
            }
        });
    });

    describe('loadAdventureLog()', () => {
        describe('when called with no ID', () => {
            it('returns a fresh adventure log', () => {
                const log = loadAdventureLog();
                expectAdventureLogisForNewGame(log);
            });
        });

        describe('when called with an ID that exists in localStorage', () => {
            let stored: AdventureLog;

            beforeEach(() => {
                stored = createNewAdventureLog();
                stored.hero.name = 'TestHero';
                stored.hero.hp = 8;
                stored.hero.maxHp = 20;
                stored.hero.mp = 9;
                stored.hero.maxMp = 21;
                stored.hero.level = 5;
                stored.hero.exp = 350;
                stored.hero.strength = 12;
                stored.hero.agility = 10;
                stored.hero.sword = 'bambooStick';
                stored.hero.armor = 'leather';
                stored.hero.shield = 'largeShield';
                stored.hero.map = 'garinham';
                stored.hero.row = 3;
                stored.hero.col = 5;
                stored.hero.direction = Direction.NORTH;
                stored.party.gold = 750;
                stored.party.inventory = [ 'Herb', 'Torch' ];
                stored.mapStates.brecconary.openedChests = [ 'chest1' ];
                stored.mapStates.overworld.obtainedHiddenItems = [ 'hiddenHerb' ];
                stored.savedGwaelin = true;
                saveAdventureLog(stored);
            });

            it('returns the stored log', () => {
                const loaded = loadAdventureLog(stored.id);
                expect(loaded.id).toBe(stored.id);
                expect(loaded.version).toBe(stored.version);
                expect(loaded.createdAt).toBe(stored.createdAt);
                expect(loaded.modifiedAt).toBe(stored.modifiedAt);
                expect(loaded.hero.name).toBe('TestHero');
                expect(loaded.hero.hp).toBe(8);
                expect(loaded.hero.maxHp).toBe(20);
                expect(loaded.hero.mp).toBe(9);
                expect(loaded.hero.maxMp).toBe(21);
                expect(loaded.hero.level).toBe(5);
                expect(loaded.hero.exp).toBe(350);
                expect(loaded.hero.strength).toBe(12);
                expect(loaded.hero.agility).toBe(10);
                expect(loaded.hero.sword).toBe('bambooStick');
                expect(loaded.hero.armor).toBe('leather');
                expect(loaded.hero.shield).toBe('largeShield');
                expect(loaded.hero.map).toBe('garinham');
                expect(loaded.hero.row).toBe(3);
                expect(loaded.hero.col).toBe(5);
                expect(loaded.hero.direction).toBe(Direction.NORTH);
                expect(loaded.party.gold).toBe(750);
                expect(loaded.party.inventory).toEqual([ 'Herb', 'Torch' ]);
                expect(loaded.mapStates.brecconary.openedChests).toEqual([ 'chest1' ]);
                expect(loaded.mapStates.overworld.obtainedHiddenItems).toEqual([ 'hiddenHerb' ]);
                expect(loaded.savedGwaelin).toBe(true);
            });
        });

        describe('when called with an ID that does not exist in localStorage', () => {
            it('returns a fresh adventure log', () => {
                const log = loadAdventureLog('nonexistent-uuid');
                expectAdventureLogisForNewGame(log);
            });

            it('returns a log with a different ID from the one requested', () => {
                const log = loadAdventureLog('nonexistent-uuid');
                expect(log.id).not.toBe('nonexistent-uuid');
            });
        });
    });

    describe('saveAdventureLog()', () => {
        it('persists the log so that it can be loaded by ID', () => {
            const log = createNewAdventureLog();
            log.hero.name = 'TestHero';
            log.hero.hp = 8;
            log.hero.maxHp = 20;
            log.hero.mp = 9;
            log.hero.maxMp = 21;
            log.hero.level = 7;
            log.hero.exp = 600;
            log.hero.strength = 14;
            log.hero.agility = 11;
            log.hero.sword = 'bambooStick';
            log.hero.armor = 'leather';
            log.hero.shield = 'largeShield';
            log.hero.map = 'garinham';
            log.hero.row = 4;
            log.hero.col = 9;
            log.hero.direction = Direction.EAST;
            log.party.gold = 800;
            log.party.inventory = [ 'Herb', 'Magic Key' ];
            log.mapStates.garinham.openedChests = [ 'chest2' ];
            log.mapStates.brecconary.unlockedDoors = [ 'door1' ];
            log.savedGwaelin = true;
            saveAdventureLog(log);

            const loaded = loadAdventureLog(log.id);
            expect(loaded.id).toBe(log.id);
            expect(loaded.version).toBe(log.version);
            expect(loaded.hero.name).toBe('TestHero');
            expect(loaded.hero.hp).toBe(8);
            expect(loaded.hero.maxHp).toBe(20);
            expect(loaded.hero.mp).toBe(9);
            expect(loaded.hero.maxMp).toBe(21);
            expect(loaded.hero.level).toBe(7);
            expect(loaded.hero.exp).toBe(600);
            expect(loaded.hero.strength).toBe(14);
            expect(loaded.hero.agility).toBe(11);
            expect(loaded.hero.sword).toBe('bambooStick');
            expect(loaded.hero.armor).toBe('leather');
            expect(loaded.hero.shield).toBe('largeShield');
            expect(loaded.hero.map).toBe('garinham');
            expect(loaded.hero.row).toBe(4);
            expect(loaded.hero.col).toBe(9);
            expect(loaded.hero.direction).toBe(Direction.EAST);
            expect(loaded.party.gold).toBe(800);
            expect(loaded.party.inventory).toEqual([ 'Herb', 'Magic Key' ]);
            expect(loaded.mapStates.garinham.openedChests).toEqual([ 'chest2' ]);
            expect(loaded.mapStates.brecconary.unlockedDoors).toEqual([ 'door1' ]);
            expect(loaded.savedGwaelin).toBe(true);
        });

        it('updates modifiedAt to the current time', () => {
            vi.useFakeTimers();
            const log = createNewAdventureLog();
            const originalModifiedAt = log.modifiedAt;

            vi.advanceTimersByTime(1000);
            saveAdventureLog(log);

            expect(log.modifiedAt).not.toBe(originalModifiedAt);
            vi.useRealTimers();
        });

        it('overwrites a previously saved log with the same ID', () => {
            const log = createNewAdventureLog();
            log.hero.level = 2;
            log.hero.hp = 10;
            log.party.gold = 200;
            saveAdventureLog(log);

            log.hero.level = 3;
            log.hero.hp = 5;
            log.party.gold = 350;
            saveAdventureLog(log);

            const loaded = loadAdventureLog(log.id);
            expect(loaded.hero.level).toBe(3);
            expect(loaded.hero.hp).toBe(5);
            expect(loaded.party.gold).toBe(350);
        });

        it('adds an entry to the summary index', () => {
            const log = createNewAdventureLog();
            log.hero.level = 3;
            saveAdventureLog(log);

            const summaries = getAdventureLogSummaries();
            expect(summaries).toHaveLength(1);
            expect(summaries[0].id).toBe(log.id);
            expect(summaries[0].heroName).toBe('Erdrick');
            expect(summaries[0].level).toBe(3);
            expect(summaries[0].createdAt).toBe(log.createdAt);
            expect(summaries[0].modifiedAt).toBe(log.modifiedAt);
        });

        it('updates the existing index entry rather than duplicating it', () => {
            const log = createNewAdventureLog();
            saveAdventureLog(log);
            log.hero.level = 4;
            saveAdventureLog(log);

            const summaries = getAdventureLogSummaries();
            expect(summaries).toHaveLength(1);
            expect(summaries[0].id).toBe(log.id);
            expect(summaries[0].heroName).toBe('Erdrick');
            expect(summaries[0].level).toBe(4);
            expect(summaries[0].createdAt).toBe(log.createdAt);
            expect(summaries[0].modifiedAt).toBe(log.modifiedAt);
        });

        it('accumulates index entries for distinct logs', () => {
            saveAdventureLog(createNewAdventureLog());
            saveAdventureLog(createNewAdventureLog());

            expect(getAdventureLogSummaries()).toHaveLength(2);
        });
    });

    describe('getAdventureLogSummaries()', () => {
        it('returns an empty array when nothing has been saved', () => {
            expect(getAdventureLogSummaries()).toEqual([]);
        });

        it('returns summaries with correct metadata', () => {
            const log = createNewAdventureLog();
            log.hero.level = 6;
            saveAdventureLog(log);

            const summaries = getAdventureLogSummaries();
            expect(summaries).toHaveLength(1);

            const [ summary ] = summaries as [ AdventureLogSummary ];
            expect(summary.id).toBe(log.id);
            expect(summary.heroName).toBe('Erdrick');
            expect(summary.level).toBe(6);
            expect(summary.createdAt).toBe(log.createdAt);
            expect(summary.modifiedAt).toBe(log.modifiedAt);
        });
    });
});
