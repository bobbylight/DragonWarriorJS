import Item, { getItemByName } from './Item';

export interface ItemCountPair {
    item: Item;
    count: number;
}

export default class Inventory {

    private readonly items: Map<Item, number>;

    constructor() {
        this.items = new Map<Item, number>();
    }

    getItems(): ItemCountPair[] {
        const items: ItemCountPair[] = [];
        this.items.forEach((value: number, key: Item) => {
            items.push({ item: key, count: value });
        });
        return items;
    }

    push(item: Item) {
        const count = this.items.get(item) ?? 0;
        this.items.set(item, count + 1);
    }

    remove(itemName: string): boolean {

        const item: Item | undefined = getItemByName(itemName);
        if (!item) {
            return false;
        }

        const count = this.items.get(item) ?? 0;
        if (count > 0) {
            if (count === 1) {
                this.items.delete(item);
            }
            else {
                this.items.set(item, count - 1);
            }
            return true;
        }
        return false;
    }

    /**
     * Returns the number of different types of items in
     * this inventory (NOT the total number of items!).
     */
    getItemTypeCount(): number {
        return this.items.size;
    }

    toString(): string {
        return `[Inventory: size=${this.items.size}]`;
    }
}
