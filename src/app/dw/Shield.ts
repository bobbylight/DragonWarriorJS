import Sellable from './Sellable';

export interface ShieldData {
    name: string;
    displayName?: string;
    baseCost?: number;
    defense?: number;
}

export default class Shield implements Sellable {

    name: string;
    displayName: string;
    baseCost: number;
    defense: number;

    constructor(name: string, args: ShieldData) {
        this.name = name;
        this.displayName = args.displayName ?? this.name;
        this.baseCost = args.baseCost ?? 0;
        this.defense = args.defense ?? 1;
    }

    toString(): string {
        return `[Shield: name=${this.name}, baseCost=${this.baseCost}, defense=${this.defense}]`;
    }
}
