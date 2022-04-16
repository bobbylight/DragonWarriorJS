/**
 * The group of one or more members in the player's party.
 */
import DwGame from './DwGame';
import PartyMember from './PartyMember';
import Inventory from './Inventory';
import Item, { KEY, TORCH } from './Item';

export default class Party {

    static readonly INVENTORY_MAX_SIZE: number = 20;

    private readonly _members: PartyMember[];
    private readonly _inventory: Inventory;
    gold: number;

    constructor(game: DwGame) {
        this._members = [];
        this._inventory = new Inventory();
        this.gold = 0;

        // Dummy data
        this.gold = 768;
        this._inventory.push(KEY);
        this._inventory.push(TORCH);
    }

    /**
     * Modifies the player's gold amount, and plays the appropriate sound effect.
     */
    addGold(amt: number) {
        this.gold = Math.max(0, this.gold + amt);
        //game.audio.playSound('gold');
    }

    /**
     * Adds an item to the party's inventory.
     */
    addInventoryItem(item: Item) {
        if (!this.isInventoryFull()) {
            this._inventory.push(item);
            return true;
        }
        return false;
    }

    /**
     * Adds a member to the party.
     *
     * @param member The new party member.
     * @see #getMember(name)
     */
    addMember(member: PartyMember) {
        this._members.push(member);
    }

    /**
     * Returns the person in the "lead" of the party; that is, the person
     * physically in the front of the marching line.
     *
     * @return The party member in the lead.
     */
    getLeader(): PartyMember {
        return this._members[0];
    }

    /**
     * Returns the party's inventory.
     *
     * @return The party's inventory.  This may be empty but will never
     *         be <code>null</code>.
     * @see #addInventoryItem(Item)
     */
    getInventory() {
        return this._inventory;
    }

    /**
     * Returns a member of the party.
     *
     * @param name The name of the party member.
     * @return The party member, or <code>undefined</code> if there
     *         is no party member by that name.
     */
    getMember(name: string): PartyMember | undefined {
        return this._members.find(member => name === member.name);
    }

    /**
     * Returns all party members.
     *
     * @return The array of party members.
     * @see #getMember(name)
     */
    getMembers(): PartyMember[] {
        return this._members;
    }

    /**
     * Returns whether the inventory is full.
     *
     * @return Whether the inventory is full.
     * @see #getInventory()
     */
    isInventoryFull(): boolean {
        return this._inventory.size() >= Party.INVENTORY_MAX_SIZE;
    }

    /**
     * Replenishes the HP and MP of all party members.
     */
    replenishHealthAndMagic() {
        this._members.forEach((partyMember: PartyMember) => {
            partyMember.replenishHealthAndMagic();
        });
    }

}
