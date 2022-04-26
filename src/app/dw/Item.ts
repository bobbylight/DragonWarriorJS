import DwGame from './DwGame';
import RoamingState from './RoamingState';

interface UseItemFunction {
    (game: DwGame): boolean;
}

interface ItemArgs {
    use: UseItemFunction;
}

export default class Item {

    name: string;
    displayName: string;
    private readonly useFunc: UseItemFunction;

    constructor(name: string, args: ItemArgs) {
        this.name = name;
        this.displayName = name;
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
    use: (game: DwGame) => {
        return game.hero.incHp(24);
    }
});

export const KEY: Item = new Item('Magic Key', {
    use: (game: DwGame) => {
        return (game.state as RoamingState).openDoor();
    }
});

export const TORCH: Item = new Item('Torch', {
    use: (game: DwGame) => {
        return game.setUsingTorch(true);
    }
});

const ITEMS: Item[] = [ HERB, KEY, TORCH ];

export const getItemByName = (name: string): Item | undefined => {
    return ITEMS.find(item => name === item.name);
};
