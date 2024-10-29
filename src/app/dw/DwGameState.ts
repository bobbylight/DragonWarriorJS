export interface MapState {
    openedChests: string[];
    unlockedDoors: string[];
}

export interface MapStateMap {
    [ mapName: string ]: MapState;
}

export default interface DwGameState {

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
        }
    };
};
