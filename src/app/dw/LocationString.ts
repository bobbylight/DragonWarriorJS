export type LocationString = `${number},${number}`;

export const toLocationString = (row: number, col: number): LocationString => {
    return `${row},${col}`;
}

export const toRowAndColumn = (location: LocationString): { row: number, col: number } => {
    const values: string[] = location.split(',');
    return { row: parseInt(values[0], 10), col: parseInt(values[1], 10) };
};
