import { Utils } from 'gtp';
import { RoamingState } from './RoamingState';
import { Sellable } from './Sellable';

type UseItemFunction = (state: RoamingState) => boolean;

interface ItemArgs {
    baseCost: number;
    use: UseItemFunction;
}

export class Item implements Sellable {

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

    use(state: RoamingState): boolean {
        return this.useFunc(state);
    }

    toString() {
        return '[Item: ' +
            'name=' + this.name +
            ']';
    }
}

export const HERB: Item = new Item('Herb', {
    baseCost: 24,
    use: (state: RoamingState) => {
        const hpRecovered = Utils.randomInt(23, 31);
        state.showOneLineConversation(false, '\\w{hero.name} used the Herb.');
        state.game.hero.incHp(hpRecovered);
        return true;
    },
});

export const KEY: Item = new Item('Magic Key', {
    baseCost: 53, // TODO: and 83 depending on where you buy!
    use: (state: RoamingState) => {
        return state.openDoor();
    },
});

export const TORCH: Item = new Item('Torch', {
    baseCost: 8,
    use: (state: RoamingState) => {
        if (state.game.getMap().getProperty('requiresTorch', false)) {
            return state.game.setUsingTorch(true);
        }
        state.showOneLineConversation(false, 'A torch can be used only in dark places.');
        return false;
    },
});

const ITEMS: Item[] = [ HERB, KEY, TORCH ];

export const getItemByName = (name: string): Item | undefined => {
    return ITEMS.find((item) => name === item.name);
};
