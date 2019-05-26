export default class Item {

    name: string;
    displayName: string;
    useFunc: Function;

    constructor(name: string, args: any) {
        this.name = name;
        this.displayName = name;
        this.useFunc = args.use;
    }

    use() {
        return this.useFunc();
    }

    toString() {
        return '[Item: ' +
            'name=' + this.name +
            ']';
    }
}

export const HERB: Item = new Item('Herb', {
    use: () => {
        (window as any).game.hero.incHp(24);
    }
});

export const KEY: Item = new Item('Key', {
    use: () => {
        return (window as any).game.state.openDoor();
    }
});

export const TORCH: Item = new Item('Torch', {
    use: () => {
        return (window as any).game.setUsingTorch(true);
    }
});
