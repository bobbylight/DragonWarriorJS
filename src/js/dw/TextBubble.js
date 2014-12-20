function TextBubble(game) {
   'use strict';
   var tileSize = game.getTileSize();
   var x = tileSize;
   var width = game.getWidth() - 2*x;
   var height = game.getTileSize() * 5;
   var y = game.getHeight() - tileSize - height;
   Bubble.call(this, null, x, y, width, height);
}

TextBubble.CHAR_RENDER_MILLIS = 0;
TextBubble.MAX_LINE_COUNT = 6;

TextBubble.prototype = Object.create(Bubble.prototype, {
   
   addToConversation: {
      value: function(text) {
         'use strict';
         this._conversation.addSegment(text);
         this._updateConversation();
      }
   },
   
   _append: {
      value: function(text) {
         'use strict';
         this._text = this._text + '\n' + text.text;
         this._curLine = this._lines.length;
         var w = this.w - 2*Bubble.MARGIN;
         var breakApartResult = this._breakApart(text.text, w);
         this._lines = this._lines.concat(breakApartResult.lines);
         this._delays = breakApartResult.delays;
         this._curOffs = -1;
         this._curCharMillis = 0;
         this._textDone = false;
         if (text.choices) {
            this._questionBubble = new QuestionBubble(game, text.choices);
         }
      }
   },
   
   /**
    * Returns whether the user is "done" talking; that is, whether the entire
    * conversation has been rendered (including multiple pages, if necessary).
    */
   handleInput: {
      value: function() {
         'use strict';
         
         if (this._textDone && this._questionBubble) {
            var result = this._questionBubble.handleInput();
            if (result) {
               var nextState = this._questionBubble.getSelectedChoiceNextDialogue();
               this._conversation.setDialogueState(nextState);
               delete this._questionBubble;
               return !this._updateConversation();
            }
            return false;
         }
         
         if (game.anyKeyDown()) {
            if (!this._textDone) {
               this._textDone = true;
               if (this._lines.length > TextBubble.MAX_LINE_COUNT) {
                  this._lines.splice(0, this._lines.length-TextBubble.MAX_LINE_COUNT);
               }
               this._curLine = this._lines.length - 1;
            }
            else {
               return !this._updateConversation();
            }
         }
         return false;
      }
   },
   
   /**
    * Returns true if the current conversation has completed.
    */
   isDone: {
      value: function() {
         'use strict';
         return this._textDone && !this._questionBubble &&
               (!this.conversation || !this.conversation.hasNext());
      }
   },
   
   update: {
      value: function(delta) {
         'use strict';
         
         if (this._delay) {
            if (this._delay.update(delta)) {
               delete this._delay;
            }
            else {
               return;
            }
         }
         
         if (!this._textDone) {
            this._curCharMillis += delta;
            if (this._curCharMillis > TextBubble.CHAR_RENDER_MILLIS) {
               this._curCharMillis -= TextBubble.CHAR_RENDER_MILLIS;
               if (this._curOffs===-1 && this._curLine===TextBubble.MAX_LINE_COUNT) {
                  this._lines.shift();
                  this._curLine--;
               }
               // TODO: This could be more performant...
               if (this._delays && this._delays.length>0) {
                  var elem = this._delays[0];
                  if (elem.offs === this._curOffs+1) {
                     this._delays.shift();
                     this._delay = new gtp.Delay({ millis: elem.millis });
                     return;
                  }
               }
               this._curOffs++;
               if (this._curOffs === this._lines[this._curLine].length) {
                  if (this._curLine === this._lines.length-1) {
                     this._textDone = true;
                  }
                  else {
                     this._curLine++;
                  }
                  this._curOffs = -1;
               }
            }
         }
         
         else if (this._questionBubble) {
            this._questionBubble.update(delta);
         }
         
      }
   },
   
   paintContent: {
      value: function(ctx, y) {
         'use strict';
         
         var x = this.x + Bubble.MARGIN;
         
         ctx.fillStyle = 'rgb(255,255,255)';
         if (this._lines) {
            for (var i=0; i<=this._curLine; i++) {
               var text = this._lines[i];
               if (!this._textDone && i===this._curLine) {
                  var end = Math.max(0, this._curOffs);
                  text = text.substring(0, end);
               }
               game.drawString(text, x, y);
               y += 10 * game._scale;
            }
            if (this._textDone && this._conversation.hasNext()) {
               // TODO: Remove magic constants
               game.drawArrow(this.x+this.w-30, this.y+this.h-30);
            }
         }
         
         if (this._textDone && this._questionBubble) {
            this._questionBubble.paint(ctx);
         }
         
      }
   },
   
   /**
    * Renders text in this bubble.
    * 
    * @param {TalkSegment} text The text to render.
    */
   _setText: {
      value: function(text) {
         'use strict';
         this._text = text.text;
         if (this._text) {
            var w = this.w - 2*Bubble.MARGIN;
            var breakApartResult = this._breakApart(this._text, w);
            this._lines = breakApartResult.lines;
            this._delays = breakApartResult.delays;
            this._curLine = 0;
            this._curOffs = -1;
            this._curCharMillis = 0;
            this._textDone = false;
         }
         if (text.choices) {
            this._questionBubble = new QuestionBubble(game, text.choices);
         }
      }
   },
   
   setConversation: {
      value: function(conversation) {
         'use strict';
         delete this._questionBubble;
         this._conversation = conversation;
         this._setText(this._conversation.start());
      }
   },
   
   _updateConversation: {
      value: function() {
         'use strict';
         if (this._conversation.hasNext()) {
            var segment = this._conversation.next();
            if (segment.clear) {
               this._setText(segment);
            }
            else {
               this._append(segment);
            }
            return true;
         }
         return false;
      }
   }
});

TextBubble.prototype.constructor = TextBubble;
