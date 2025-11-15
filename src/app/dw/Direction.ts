// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Direction {

    static readonly NORTH: number = 0;
    static readonly EAST: number = 1;
    static readonly SOUTH: number = 2;
    static readonly WEST: number = 3;

    static fromString(str = 'SOUTH'): number {

        switch (str.toUpperCase()) {
            case 'NORTH':
                return Direction.NORTH;
            case 'EAST':
                return Direction.EAST;
            case 'WEST':
                return Direction.WEST;
            case 'SOUTH':
                return Direction.SOUTH;
            default:
                return Direction.SOUTH;
        }
    }
}
