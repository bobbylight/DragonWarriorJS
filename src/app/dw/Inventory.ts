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

    /**
     * Returns the number of different types of items in
     * this inventory (NOT the total number of items!).
     */
    getItemTypeCount(): number {
        return this.items.length;
    }

    toString(): string {
        return `[Inventory: size=${this.items.length}]`;
    }
}
