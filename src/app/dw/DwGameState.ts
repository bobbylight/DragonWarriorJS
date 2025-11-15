export interface MapState {
    openedChests: string[];
    unlockedDoors: string[];
}

export type MapStateMap = Record<string, MapState>;

export interface DwGameState {

    savedGwaelin?: boolean;

    mapStates: MapStateMap;
}

const createEmtpyMapState = (): MapState => {
    return {
        openedChests: [],
        unlockedDoors: [],
    };
};

export const createDefaultGameState = (): DwGameState => {
    return {
        mapStates: {
            tantegelCastle: createEmtpyMapState(),
        },
    };
};
