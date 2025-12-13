export interface MapState {
    obtainedHiddenItems: string[];
    openedChests: string[];
    unlockedDoors: string[];
}

export type MapStateMap = Record<string, MapState>;

export interface DwGameState {

    savedGwaelin?: boolean;

    mapStates: MapStateMap;
}

const createEmptyMapState = (): MapState => {
    return {
        obtainedHiddenItems: [],
        openedChests: [],
        unlockedDoors: [],
    };
};

export const createDefaultGameState = (): DwGameState => {
    return {
        mapStates: {
            brecconary: createEmptyMapState(),
            garinham: createEmptyMapState(),
            overworld: createEmptyMapState(),
            tantegelCastle: createEmptyMapState(),
        },
    };
};
