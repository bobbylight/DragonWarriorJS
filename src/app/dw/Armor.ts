import Sellable from './Sellable';

export default class Armor implements Sellable {

    name: string;
    displayName: string;
    baseCost: number;
    defense: number;

    constructor(name: string, args: any) {
        this.name = name;
        this.displayName = args.displayName || this.name;
        this.baseCost = args.baseCost || 0;
        this.defense = args.defense || 1;
    }

    toString(): string {
        return '[Armor: ' +
            'name=' + this.name +
            ', baseCost=' + this.baseCost +
            ', defense=' + this.defense +
            ']';
    }
}
