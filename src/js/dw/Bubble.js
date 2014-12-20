function Bubble(title, x, y, w, h) {
   'use strict';
   this.title = title;
   var scale = 1;//game._scale;
   this.x = x * scale;
   this.y = y * scale;
   this.w = w * scale;
   this.h = h * scale;
   
   this._fontWidth = game.assets.get('font').cellW;
   
//      int strokeW = 2 * SCALE;
//      borderStroke = new BasicStroke(strokeW, BasicStroke.CAP_ROUND,
//                              BasicStroke.JOIN_ROUND);
}

Bubble.MARGIN = 10; // 5 * SCALE; TODO

Bubble.prototype = {
   
   _breakApart: function(text, w) {
      'use strict';
      
      var result = { lines: [], delays: [] };
      
      // Newlines are automatic line breaks
      text = this._removeSpecialEscapes(text, result.delays);
      var lineList = text.split('\n');
      
      for (var i=0; i<lineList.length; i++) {
         this._breakApartLine(lineList[i], w, result);
      }
      
      return result;
   },
   
   /**
    * Locates special escapes in text and addds entries into the appropriate
    * arrays (delays, font color changes, etc.).
    * 
    * @param {string} text The text to scan.
    * @param {array} delays The array to put delays into.
    * @return {string} The text, with any escapes removed.
    */
   _removeSpecialEscapes: function(text, delays) {
      
      // Delay formats:
      //    \d      - default ms
      //    \d{300} - 300 ms
      
      var index, lastOffs = 0;
      while ((index = text.indexOf('\\d', lastOffs)) > -1) {
         
         if ((index + 2) < text.length && text.charAt(index + 2) === '{') {
            var end = text.indexOf('}', index + 3);
            if (end > -1) {
               var delay = parseInt(text.substring(index + 3, end));
               console.log('Adding a delay of ' + delay + ' ms');
               delays.push({ offs: index, millis: delay });
               text = text.substring(0, index) + text.substring(end + 1);
            }
            else {
               console.warn('Suspicious, aparent unclosed delay at offset ' + start);
            }
         }
         
         else {
            var delay = 500;
            console.log('Adding the default delay of ' + delay + ' ms');
            delays.push({ offs: index, millis: delay });
            text = text.substring(0, index) + text.substring(index + 2);
         }
         
         lastOffs = index;
      }
      
      return text;
   },
   
   _breakApartLine: function(line, w, result) {
      'use strict';
      
      var optimal = Math.floor(w / this._fontWidth);
      
      while (line.length > optimal) {
         
         var offs = optimal - 1;
         var ch = line.charAt(offs);
         while (ch!==' ') {
            ch = line.charAt(--offs);
         }
         result.lines.push(line.substring(0, offs));
         
         line = line.substring(offs).trim();
      }
      
      //if (line.length>0) {
         result.lines.push(line);
      //}
   },
   
   paint: function(ctx) {
      'use strict';
      
      var scale = game._scale;
      var fontHeight = game.stringHeight();
      
      ctx.fillStyle = 'rgb(0,0,0)';
      ctx.fillRect(this.x,this.y, this.w,this.h);
      
      // TODO: border via graphics
      ctx.strokeStyle = 'rgb(255,255,255)';
      ctx.lineWidth = 2;
      var doubleScale = 2 * scale;
      ctx.strokeRect(this.x+doubleScale, this.y+doubleScale, this.w-2*doubleScale, this.h-2*doubleScale);
      
      if (this.title) {
         ctx.fillStyle = 'rgb(0,0,0)';
         var stringW = game.stringWidth(this.title);
         stringW += 4 * scale;
         var x = this.x + Math.floor((this.w-stringW)/2);
         ctx.fillRect(x, this.y, stringW, fontHeight);
         
         ctx.fillStyle = 'rgb(255,255,255)';
         game.drawString(this.title, x+2*scale, this.y);
      }
      
      this.paintContent(ctx, this.y+this.getYMargin());
   },
   
   getXMargin: function() {
      'use strict';
      return 8 * game._scale;
   },
   
   getYMargin: function() {
      'use strict';
      return this.title ? game.getTileSize() : (8 * game._scale);
   },
   
   update: function(delta) {
      // Should be overridden
   },
   
   paintContent: function(ctx, y) {
      // Should be overridden
   }

};
