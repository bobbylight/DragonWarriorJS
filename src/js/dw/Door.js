dw.Door = function(name, row, col, replacementTileIndex) {
   'use strict';
   this.name = name;
   this.replacementTileIndex = replacementTileIndex;
   this.row = row;
   this.col = col;
};

dw.Door.prototype = {
   
   isAt: function(row, col) {
      'use strict';
      return this.row === row && this.col === col;
   },
   
   toString: function() {
      'use strict';
      return '[dw.Door: ' +
            'name=' + this.name +
            ', row=' + this.row +
            ', col=' + this.col +
            ']';
   }
};

dw.Door.prototype.constructor = dw.Door;
