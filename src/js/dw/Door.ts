export default class Door {

    name: string;
    replacementTileIndex: number;
    row: number;
    col: number;

    constructor(name: string, row: number, col: number, replacementTileIndex: number) {
        this.name = name;
        this.replacementTileIndex = replacementTileIndex;
        this.row = row;
        this.col = col;
    }

    isAt(row: number, col: number): boolean {
        return this.row === row && this.col === col;
    }

    toString(): string {
        return '[dw.Door: ' +
            'name=' + this.name +
            ', row=' + this.row +
            ', col=' + this.col +
            ']';
    }
}
