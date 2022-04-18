import Npc from '../Npc';

/**
 * Logic for an RPG map.  Handles things such as what an NPC should say.
 * Implementations of this interface map one-to-one with Tiled maps, and
 * represent everything the hero can do on that map.
 */
export default interface MapLogic {

   /**
    * Called when a map is entered.  This gives the logic a chance to
    * initialize based on the game state, etc.
    */
   init();

   /**
    * Returns the text for a specific NPC to say.
    *
    * @param npc The NPC.
    */
   npcText(npc: Npc): string;
}
