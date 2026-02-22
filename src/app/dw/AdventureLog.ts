import { Direction } from './Direction';

/**
 * Part of an adventure log that logs the status of a specific map.
 */
export interface MapState {
    obtainedHiddenItems: string[];
    openedChests: string[];
    unlockedDoors: string[];
}

export type MapStateMap = Record<string, MapState>;

const createEmptyMapState = (): MapState => {
    return {
        obtainedHiddenItems: [],
        openedChests: [],
        unlockedDoors: [],
    };
};

/**
 * A lightweight summary of an adventure log, used to populate the save-select
 * screen without loading the full log.
 */
export interface AdventureLogSummary {
    id: string;
    heroName: string;
    level: number;
    createdAt: string;
    modifiedAt: string;
}

/**
 * A saved game's progress. This is also used to track live,
 * unsaved changes as the user plays.
 */
export interface AdventureLog {
    id: string;
    version: number;
    createdAt: string;
    modifiedAt: string;
    hero: {
        name: string;
        hp: number;
        mp: number;
        maxHp: number;
        maxMp: number;
        level: number;
        exp: number;
        strength: number;
        agility: number;
        sword: string;
        shield: string;
        armor: string;
        map: string;
        row: number;
        col: number;
        direction: number;
    };
    party: {
        gold: number;
        inventory: string[];
    };
    mapStates: MapStateMap;
    savedGwaelin: boolean;
}

/**
 * Creates a fresh adventure log for a new game.
 */
export const createNewAdventureLog = (): AdventureLog => {
    const now = new Date().toISOString();
    return {
        id: crypto.randomUUID(),
        version: 1,
        createdAt: now,
        modifiedAt: now,
        hero: {
            name: 'Erdrick',
            hp: 15,
            mp: 15,
            maxHp: 15,
            maxMp: 15,
            level: 1,
            exp: 0,
            strength: 4,
            agility: 4,
            sword: 'club',
            armor: 'clothes',
            shield: 'smallShield',
            map: 'brecconary',
            row: 7,
            col: 6,
            direction: Direction.SOUTH,
        },
        party: {
            gold: 120,
            inventory: [
                'Magic Key',
                'Torch',
                'Magic Key',
                'Torch',
                'Herb',
                'Herb',
            ],
        },
        mapStates: {
            brecconary: createEmptyMapState(),
            garinham: createEmptyMapState(),
            overworld: createEmptyMapState(),
            tantegelCastle: createEmptyMapState(),
        },
        savedGwaelin: false,
    };
};

const KEY_PREFIX = 'dw:adventureLog:';
const INDEX_KEY = 'dw:adventureLogIndex';

/**
 * Loads an adventure log from localStorage by ID, or creates a new one if no
 * ID is given or the ID is not found in storage.
 */
export const loadAdventureLog = (id?: string): AdventureLog => {
    if (id) {
        const json = localStorage.getItem(KEY_PREFIX + id);
        if (json) {
            return JSON.parse(json) as AdventureLog;
        }
    }
    return createNewAdventureLog();
};

/**
 * Persists an adventure log to localStorage and updates the summary index.
 * Mutates {@link AdventureLog.modifiedAt} to the current time.
 */
export const saveAdventureLog = (log: AdventureLog): void => {
    log.modifiedAt = new Date().toISOString();
    localStorage.setItem(KEY_PREFIX + log.id, JSON.stringify(log));
    updateIndex(log);
};

const updateIndex = (log: AdventureLog): void => {
    const json = localStorage.getItem(INDEX_KEY);
    const summaries: AdventureLogSummary[] = json ? JSON.parse(json) as AdventureLogSummary[] : [];
    const summary: AdventureLogSummary = {
        id: log.id,
        heroName: log.hero.name,
        level: log.hero.level,
        createdAt: log.createdAt,
        modifiedAt: log.modifiedAt,
    };
    const existingIndex = summaries.findIndex((s) => s.id === log.id);
    if (existingIndex >= 0) {
        summaries[existingIndex] = summary;
    } else {
        summaries.push(summary);
    }
    localStorage.setItem(INDEX_KEY, JSON.stringify(summaries));
};

/**
 * Returns summary metadata for all saved adventure logs, suitable for
 * populating a save-select screen.
 */
export const getAdventureLogSummaries = (): AdventureLogSummary[] => {
    const json = localStorage.getItem(INDEX_KEY);
    return json ? JSON.parse(json) as AdventureLogSummary[] : [];
};
