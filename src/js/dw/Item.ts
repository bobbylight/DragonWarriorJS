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

export class Items {

    static readonly HERB: Item = new Item('Herb', {
        use: function () {
            'use strict';
            game.hero.incHp(24);
        }
    });

    static readonly KEY = new Item('Key', {
        use: function () {
            'use strict';
            return game.state.openDoor();
        }
    });

    static readonly TORCH = new Item('Torch', {
        use: function () {
            'use strict';
            return game.setUsingTorch(true);
        }
    });

}
