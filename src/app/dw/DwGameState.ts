export interface MapState {
    openedChests: string[];
    unlockedDoors: string[];
}

export default interface DwGameState {

    savedGwaelin?: boolean;

    mapStates: {
        tantegelCastle: MapState;
    };
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
