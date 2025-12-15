import { Item, getItemByName } from './Item';
import { Party } from '@/app/dw/Party';

export class Inventory {

    private readonly items: Item[];

    constructor() {
        this.items = [];
    }

    getItems(): Item[] {
        return this.items.slice();
    }

    /**
     * Returns the number of items in the inventory.
     */
    getSize(): number {
        return this.items.length;
    }

    push(item: Item) {
        if (this.items.length < Party.INVENTORY_MAX_SIZE) {
            this.items.push(item);
        }
    }

    remove(itemName: string): boolean {

        const item: Item | undefined = getItemByName(itemName);
        if (!item) {
            return false;
        }

        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    toString(): string {
        return `[Inventory: size=${this.items.length}]`;
    }
}
