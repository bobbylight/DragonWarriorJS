import Item from './Item';

export default class Inventory {

    private readonly _items: Item[];

    constructor() {
        this._items = [];
    }

    getItems(): Item[] {
        return this._items;
    }

    push(item) {
        this._items.push(item);
    }

    size(): number {
        return this._items.length;
    }

    toString(): string {
        return '[Inventory: ' +
            'size=' + this._items.length +
            ']';
    }
}
