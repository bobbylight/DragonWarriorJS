import { LocationString } from './LocationString';

// TODO: Can this be pulled from/match items somehow?
export type ChestContentType = 'gold' | 'magicKey';

export interface Chest {
    id: string;
    contentType: ChestContentType;
    contents: number | (() => number);
    location: LocationString;
}
