export default class Armor {

    name: string;
    baseCost: number;
    defense: number;
    displayName: string;

    constructor(name: string, args: any) {
        this.name = name;
        this.baseCost = args.baseCost || 0;
        this.defense = args.defense || 1;
        this.displayName = args.displayName || this.name;
    }

    toString(): string {
        return '[Armor: ' +
            'name=' + this.name +
            ', baseCost=' + this.baseCost +
            ', defense=' + this.defense +
            ']';
    }
}
