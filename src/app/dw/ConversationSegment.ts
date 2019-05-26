import { Utils } from 'gtp';
import DwGame from './DwGame';
import Conversation from './Conversation';

export default class ConversationSegment {

   private readonly game: DwGame;
   parentConversation: Conversation;
   action: any | null;
   next: string | null;
   id: string | null;
   overnight: boolean | null;
   clear: boolean | null;
   private readonly text: string;

   constructor(parentConversation: Conversation, args: any) {

      this.parentConversation = parentConversation;
      this.game = (window as any).game;
      Utils.mixin(args, this);
   }

   _getParameterizedText() {

      let text: string = this.text;

      // TODO: This could be much, much better
      let lbrace: number = text.indexOf('\\w{');
      while (lbrace > -1) {
         const rbrace: number = text.indexOf('}', lbrace + 3);
         if (rbrace > -1) {
            const expression: string = text.substring(lbrace + 3, rbrace);
            switch (expression) {
               case 'hero.name':
                  text = text.substring(0, lbrace) + this.game.hero.name + text.substring(rbrace + 1);
                  lbrace = text.indexOf('\\w{', lbrace + this.game.hero.name.length);
                  break;
               case 'item.name':
                  const itemName: string = this.parentConversation.item.displayName;
                  text = text.substring(0, lbrace) + itemName + text.substring(rbrace + 1);
                  lbrace = text.indexOf('\\w{', lbrace + itemName.length);
                  break;
               case 'item.baseCost':
                  text = text.substring(0, lbrace) + this.parentConversation.item.baseCost + text.substring(rbrace + 1);
                  lbrace = text.indexOf('\\w{', lbrace + this.parentConversation.item.baseCost.toString().length);
                  break;
               default:
                  console.error('Unknown token in NPC text: ' + expression);
                  lbrace = -1;
                  break;
            }
         }
      }

      return text;
   }

   currentText() {
      return this._getParameterizedText();
   }
}
