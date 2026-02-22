import { Npc } from '../Npc';
import { DwGame } from '../DwGame';
import { ConversationSegmentArgs, ConversationTemplate } from '../ConversationSegment';

/**
 * Logic for an RPG map.  Handles things such as what an NPC should say.
 * Implementations of this interface map one-to-one with Tiled maps, and
 * represent everything the hero can do on that map.
 */
export interface MapLogic {

   /**
    * Called when a map is entered.  This gives the logic a chance to
    * initialize based on the game state, etc.
    */
   init(): void;

   /**
    * Returns the conversation flow when talking to a particular NPC.
    *
    * @param npc The NPC.
    * @param game The game being played.
    */
   npcText(npc: Npc, game: DwGame): NpcText;
}

/**
 * This defines the conversation with an NPC. In the simplest case, it is a
 * static string or array of strings. Alternatively, it can be a complex
 * conversation, with logic and different results depending on things such
 * as user choices.
 */
export type NpcText = string | ConversationSegmentArgs | ConversationTemplate | (string | ConversationSegmentArgs)[];
