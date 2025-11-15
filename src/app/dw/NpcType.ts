// TODO: Convert this to a union type or some simpler struct
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class NpcType {
    static readonly SOLDIER_GRAY: number = 0;
    static readonly SOLDIER_RED: number = 1;
    static readonly MAN_BLUE: number = 2;
    static readonly WOMAN_BLUE: number = 3;
    static readonly MERCHANT_GREEN: number = 4;
    static readonly OLD_MAN_GRAY: number = 5;
    static readonly KING: number = 6;
}

export const getNpcType = (type: string): NpcType => {
    switch (type) {
        case 'SOLDIER_GRAY':
            return 0;
        case 'SOLDIER_RED':
            return 1;
        case 'MAN_BLUE':
            return 2;
        case 'WOMAN_BLUE':
            return 3;
        case 'MERCHANT_GREEN':
            return 4;
        case 'OLD_MAN_GRAY':
            return 5;
        case 'KING':
            return 6;
        default:
            return NpcType.MERCHANT_GREEN;
    }
}
