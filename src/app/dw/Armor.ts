import { Sellable } from './Sellable';

export interface ArmorData {
    name: string;
    displayName?: string;
    baseCost?: number;
    defense?: number;
}

export class Armor implements Sellable {

    name: string;
    displayName: string;
    baseCost: number;
    defense: number;

    constructor(name: string, args: ArmorData) {
        this.name = name;
        this.displayName = args.displayName ?? this.name;
        this.baseCost = args.baseCost ?? 0;
        this.defense = args.defense ?? 1;
    }

    toString(): string {
        return `[Armor: name=${this.name}, baseCost=${this.baseCost}, defense=${this.defense}]`;
    }
}
