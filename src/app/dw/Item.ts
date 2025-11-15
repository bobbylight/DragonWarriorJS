import DwGame from './DwGame';
import RoamingState from './RoamingState';
import Sellable from './Sellable';

type UseItemFunction = (game: DwGame) => boolean;

interface ItemArgs {
    baseCost: number;
    use: UseItemFunction;
}

export default class Item implements Sellable {

    name: string;
    displayName: string;
    baseCost: number;
    private readonly useFunc: UseItemFunction;

    constructor(name: string, args: ItemArgs) {
        this.name = name;
        this.displayName = name;
        this.baseCost = args.baseCost || 0;
        this.useFunc = args.use;
    }

    use(game: DwGame): boolean {
        return this.useFunc(game);
    }

    toString() {
        return '[Item: ' +
            'name=' + this.name +
            ']';
    }
}

export const HERB: Item = new Item('Herb', {
    baseCost: 24,
    use: (game: DwGame) => {
        return game.hero.incHp(24);
    },
});

export const KEY: Item = new Item('Magic Key', {
    baseCost: 53, // TODO: and 83 depending on where you buy!
    use: (game: DwGame) => {
        return (game.state as RoamingState).openDoor();
    },
});

export const TORCH: Item = new Item('Torch', {
    baseCost: 8,
    use: (game: DwGame) => {
        return game.setUsingTorch(true);
    },
});

const ITEMS: Item[] = [ HERB, KEY, TORCH ];

export const getItemByName = (name: string): Item | undefined => {
    return ITEMS.find(item => name === item.name);
};
