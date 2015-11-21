/**
 * The group of one or more members in the player's party.
 * @constructor
 */
dw.Party = function(game) {
   'use strict';
   this._members = [];
   this._inventory = new dw.Inventory();
   this.gold = 0;
   
   // Dummy data
   this.gold = 768;
   this._inventory.push(dw.Items.KEY);
   this._inventory.push(dw.Items.TORCH);
};

dw.Party.INVENTORY_MAX_SIZE = 20;

dw.Party.prototype = {
   
   /**
    * Modifies the player's gold amount, and plays the appropriate sound effect.
    */
   addGold: function(amt) {
      'use strict';
      this.gold = Math.max(0, this.gold + amt);
      //game.audio.playSound('gold');
   },
   
   /**
    * Adds an item to the party's inventory.
    */
   addInventoryItem: function(item) {
      'use strict';
      if (!this.isInventoryFull()) {
         this._inventory.push(item);
         return true;
      }
      return false;
   },
   
   /**
    * Adds a member to the party.
    * 
    * @param {PartyMember} member The new party member.
    * @see #getMember(name)
    */
   addMember: function(member) {
      'use strict';
      this._members.push(member);
   },
   
   /**
    * Returns the person in the "lead" of the party; that is, the person
    * physically in the front of the marching line.
    * 
    * @return {PartyMember} The party member in the lead.
    */
   getLeader: function() {
      'use strict';
      return this._members[0];
   },
   
   /**
    * Returns the party's inventory.
    * 
    * @return {Item[]} The party's inventory.  This may be empty but will never
    *         be <code>null</code>.
    * @see #addInventoryItem(Item)
    */
   getInventory: function() {
      'use strict';
      return this._inventory;
   },
   
   /**
    * Returns a member of the party.
    * 
    * @param {String} name The name of the party member.
    * @return {PartyMember} The party member, or <code>null</code> if there
    *         is no party member by that name.
    */
   getMember: function(name) {
      'use strict';
      for (var i = 0; i < this._members.length; i++) {
         if (this._members[i].name === name) {
            return this._members[i];
         }
      }
      return null;
   },
   
   /**
    * Returns all party members.
    *
    * @return {PartyMember[]} The array of party members.
    * @see #getMember(name)
    */
   getMembers: function() {
      'use strict';
      return this._members;
   },
   
   /**
    * Returns whether the inventory is full.
    *
    * @return {boolean} Whether the inventory is full.
    * @see #getInventory()
    */
   isInventoryFull: function() {
      'use strict';
      return this._inventory.length >= dw.Party.INVENTORY_MAX_SIZE;
   },
   
   /**
    * Replenishes the HP and MP of all party members.
    */
   replenishHealthAndMagic: function() {
      'use strict';
      this._members.forEach(function(partyMember) {
         partyMember.replenishHealthAndMagic();
      });
   }
   
};

dw.Party.prototype.constructor = dw.Party;
