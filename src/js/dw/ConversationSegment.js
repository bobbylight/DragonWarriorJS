function ConversationSegment(parentConversation, args) {
   'use strict';
   this.parentConversation = parentConversation;
   gtp.Utils.mixin(args, this);
}

ConversationSegment.prototype = {
   
   _getParameterizedText: function() {
      'use strict';
      
      var text = this.text;
      
      // TODO: This could be much, much better
      var lbrace = text.indexOf('\\w{');
      while (lbrace > -1) {
         var rbrace = text.indexOf('}', lbrace+3);
         if (rbrace > -1) {
            var expression = text.substring(lbrace+3, rbrace);
            switch (expression) {
               case 'hero.name':
                  text = text.substring(0, lbrace) + game.hero.name + text.substring(rbrace+1);
                  lbrace = text.indexOf('\\w{', lbrace+game.hero.name.length);
                  break;
               case 'item.name':
                  var itemName = this.parentConversation.item.displayName;
                  text = text.substring(0, lbrace) + itemName + text.substring(rbrace+1);
                  lbrace = text.indexOf('\\w{', lbrace + itemName.length);
                  break;
               case 'item.baseCost':
                  text = text.substring(0, lbrace) + this.parentConversation.item.baseCost + text.substring(rbrace+1);
                  lbrace = text.indexOf('\\w{', lbrace+this.parentConversation.item.baseCost.toString().length);
                  break;
               default:
                  console.error('Unknown token in NPC text: ' + expression);
                  lbrace = -1;
                  break;
            }
         }
      }
      
      return text;
   },
   
   currentText: function() {
      'use strict';
      return this._getParameterizedText(this.text, this);
   }
   
};

ConversationSegment.prototype.constructor = ConversationSegment;
