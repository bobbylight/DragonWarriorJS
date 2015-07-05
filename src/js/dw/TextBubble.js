dw.TextBubble = function(game) {
   'use strict';
   var tileSize = game.getTileSize();
   var x = tileSize;
   var width = game.getWidth() - 2*x;
   var height = game.getTileSize() * 5;
   var y = game.getHeight() - tileSize - height;
   dw.Bubble.call(this, null, x, y, width, height);
   this._doneCallbacks = [];
};

dw.TextBubble.CHAR_RENDER_MILLIS = 0;
dw.TextBubble.MAX_LINE_COUNT = 6;

dw.TextBubble.prototype = Object.create(dw.Bubble.prototype, {
   
   addToConversation: {
      value: function(text, autoAdvance) {
         'use strict';
         this._conversation.addSegment(text);

         if (autoAdvance && this._textDone) {
            this._updateConversation();
         }
         else {
            console.log('oh no - ' + autoAdvance + ', ' + this._textDone);
         }
      }
   },
   
   _append: {
      value: function(segment) {
         'use strict';
         var curText = segment.currentText();
         this._text = this._text + '\n' + curText;
         this._curLine = this._lines.length;
         var w = this.w - 2*dw.Bubble.MARGIN;
         var breakApartResult = this._breakApart(curText, w);
         this._lines = this._lines.concat(breakApartResult.lines);
         this._delays = breakApartResult.delays;
         this._curOffs = -1;
         this._curCharMillis = 0;
         this._textDone = false;
console.log('>>> textDone set to false');
         if (segment.choices) {
            this._questionBubble = new dw.QuestionBubble(game, segment.choices);
         }
         else if (segment.shopping) {
            this._shoppingBubble = new dw.ShoppingBubble(game, segment.shopping);
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
         
         var result, nextState;
         
         if (this._textDone) {
            if (this._shoppingBubble) {
               result = this._shoppingBubble.handleInput();
               if (result) {
                  var item = this._shoppingBubble.getSelectedItem();
                  delete this._shoppingBubble;
                  this._conversation.setItem(item);
                  nextState = item.baseCost > game.hero.gold ?
                     dw.Conversation.NOT_ENOUGH_SEGMENT : dw.Conversation.CONFIRM_SEGMENT;
                  return !this._updateConversation(nextState);
               }
               return false;
            }
            else if (this._questionBubble) {
               result = this._questionBubble.handleInput();
               if (result) {
                  nextState = this._questionBubble.getSelectedChoiceNextDialogue();
                  //this._conversation.setDialogueState(nextState);
                  delete this._questionBubble;
                  return !this._updateConversation(nextState);
               }
               return false;
            }
         }
         
         if (game.anyKeyDown()) {
            if (!this._textDone) {
               this._textDone = true;
               if (this._lines.length > dw.TextBubble.MAX_LINE_COUNT) {
                  this._lines.splice(0, this._lines.length-dw.TextBubble.MAX_LINE_COUNT);
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
    * Forces the conversation to go to the next segment.  Should only be called
    * internally.  This is a sign of bad design.
    */
   nudgeConversation: {
      value: function() {
         'use strict';
         this._updateConversation();
      }
   },
   
   /**
    * Returns true if the current conversation has completed.
    */
   isDone: {
      value: function() {
         'use strict';
         return this._textDone && !this._questionBubble &&
               !this._shoppingBubble &&
               (!this._conversation || !this._conversation.hasNext());
      }
   },
   
   currentTextDone: {
      value: function() {
         'use strict';
         return this._textDone;
      }
   },
   
   isOvernight: {
      value: function() {
         'use strict';
         return this._overnight;
      }
   },
   
   clearOvernight: {
      value: function(overnight) {
         'use strict';
         delete this._overnight;
      }
   },
   
   onDone: {
      value: function(callback) {
         'use strict';
         if (this.isDone()) {
            callback();
         }
         else {
            this._doneCallbacks.push(callback);
         }
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
            if (this._curCharMillis > dw.TextBubble.CHAR_RENDER_MILLIS) {
               this._curCharMillis -= dw.TextBubble.CHAR_RENDER_MILLIS;
               if (this._curOffs===-1 && this._curLine===dw.TextBubble.MAX_LINE_COUNT) {
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
console.log('Setting textDone to true');
                     this._textDone = true;
                  }
                  else {
console.log('Going to next line');
                     this._curLine++;
                  }
                  this._curOffs = -1;
               }
            }
         }
         
         else if (this._shoppingBubble) {
            this._shoppingBubble.update(delta);
         }
         
         else if (this._questionBubble) {
            this._questionBubble.update(delta);
         }
         
         if (this._doneCallbacks.length > 0 && this.isDone()) {
            this._doneCallbacks.forEach(function(callback) {
               callback();
            });
            this._doneCallbacks = [];
         }
         
      }
   },
   
   paintContent: {
      value: function(ctx, y) {
         'use strict';
         
         var x = this.x + dw.Bubble.MARGIN;
         
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
               game.drawDownArrow(this.x+this.w-30, this.y+this.h-30);
               /*
               var conv = this._conversation;
               console.log('--- ' +
                     JSON.stringify(this._conversation.peekNext(),
                           // Custom replacer to prevent circular printing of conversation
                           function(key, value) {
                              if (value === conv) {
                                 return;
                              }
                              return value;
                           }
                     )
               );
               */
            }
         }
         
         if (this._textDone) {
            if (this._shoppingBubble) {
               this._shoppingBubble.paint(ctx);
            }
            else if (this._questionBubble) {
               this._questionBubble.paint(ctx);
            }
         }
         
      }
   },
   
   /**
    * Renders text in this bubble.
    * 
    * @param {TalkSegment} text The text to render.
    */
   _setText: {
      value: function(segment) {
         'use strict';
         this._text = segment.currentText();
         if (this._text) {
            var w = this.w - 2*dw.Bubble.MARGIN;
            var breakApartResult = this._breakApart(this._text, w);
            this._lines = breakApartResult.lines;
            this._delays = breakApartResult.delays;
            this._curLine = 0;
            this._curOffs = -1;
            this._curCharMillis = 0;
            this._textDone = false;
console.log('>>> textDone set to false');
         }
         if (segment.choices) {
            this._questionBubble = new dw.QuestionBubble(game, segment.choices);
         }
         else if (segment.shopping) {
            this._shoppingBubble = new dw.ShoppingBubble(game, segment.shopping.choices);
         }
      }
   },
   
   setConversation: {
      value: function(conversation) {
         'use strict';
         delete this._shoppingBubble;
         delete this._questionBubble;
         this._conversation = conversation;
         this._setText(this._conversation.start());
      }
   },
   
   _updateConversation: {
      value: function(forcedNextState) {
         'use strict';
         if (forcedNextState || this._conversation.hasNext()) {
            if (this._conversation.current().overnight && this._textDone) {
               this._overnight = true;
            }
            var segment;
            if (forcedNextState) {
               this._conversation.setDialogueState(forcedNextState);
               segment = this._conversation.current();
            }
            else {
               segment = this._conversation.next();
            }
//            if (segment.overnight) {
//               this._overnight = true;
//            } else
            if (segment.clear) {
               this._setText(segment);
            }
            else {
               this._append(segment);
            }
            if (segment.sound) {
               game.audio.playSound(segment.sound);
            }
            if (segment.music) {
               game.audio.playMusic(segment.music);
            }
            return true;
         }
         return false;
      }
   }
});

dw.TextBubble.prototype.constructor = dw.TextBubble;
