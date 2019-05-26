export default class Weapon {

    name: string;
    baseCost: number;
    power: number;
    displayName: string;

    constructor(name: string, args: any) {
        this.name = name;
        this.baseCost = args.baseCost || 0;
        this.power = args.power || 1;
        this.displayName = args.displayName || this.name;
    }

    toString() {
        return '[Weapon: ' +
            'name=' + this.name +
            ', baseCost=' + this.baseCost +
            ', power=' + this.power +
            ']';
    }
}
