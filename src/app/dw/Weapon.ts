import Sellable from './Sellable';

export default class Weapon implements Sellable {

    name: string;
    displayName: string;
    baseCost: number;
    power: number;

    constructor(name: string, args: any) {
        this.name = name;
        this.displayName = args.displayName || this.name;
        this.baseCost = args.baseCost || 0;
        this.power = args.power || 1;
    }

    toString() {
        return '[Weapon: ' +
            'name=' + this.name +
            ', baseCost=' + this.baseCost +
            ', power=' + this.power +
            ']';
    }
}
