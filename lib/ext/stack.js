//
// Not yet an extension, just factoring out stuff...
//

// // Try to define non enumerable properties
// if(typeof Object.defineProperties === 'function'){
  
//   var _stack;
//   Object.defineProperty(Cannot.prototype, '_stack', {
//     get : function(){ return _stack; },
//     set : function(newValue){ _stack = newValue; },
//     configurable: true
//   });
  
// }

// /**
//  * Get a stack trace array, default for node.
//  * Override this method with a stacktrace method for browser usage
//  *
//  * @api private
//  */
// Cannot.prototype._getStack = function(){
//   // Generate and store stack
//   if(Cannot._config.stackActive && !this._hasStack){
//     this._hasStack = true;
//     var lines = this.stack.split('\n');
//     var reduceBy = this._methodUse ? 2 : 1;
//     lines.splice(0, reduceBy);
//     this._stack = lines;
//     this._info = Cannot.parseTraceLine(lines[0]);

//     return lines;    
//   }
// }

// /**
//  * Parse the filename, path, and line number from a V8 exception stack trace line
//  *
//  * @param {String} line
//  * @return {Object} Collected information from the stack trace line
//  * @api public
//  */
// Cannot.parseTraceLine = function(line){
//   var split = line.split('/');
//   var lastSplit = split[split.length - 1];
//   var at = null;

//   if(line.match(/at\s.*\s\(/ig)){
//     at = line.slice(line.indexOf('at ') + 3, line.indexOf(' ('));
//   }
//   // TODO: parse path correctly if we have a stack trace line without method name (anonymous function)

//   var info = {
//     at: at,
//     path: line.slice(line.indexOf('(') + 1, line.lastIndexOf('/') + 1),
//     filename: lastSplit.slice(0, lastSplit.indexOf(':')),
//     line: parseInt(lastSplit.slice(lastSplit.indexOf(':') + 1, lastSplit.lastIndexOf(':')), 10),
//     column: parseInt(lastSplit.slice(lastSplit.lastIndexOf(':') + 1, lastSplit.lastIndexOf(')')), 10)
//   }
//   return info;
// }

// /**
//  * A human readable message from the Cannot data.
//  * This method only provides the expected output (message with stack info), if Cannot._config.stackActive == true.
//  *
//  * @api public
//  */
// Cannot.prototype.__defineGetter__('stackMessage', function() {
//   Cannot._config.automaticHandle && this._handle();
//   return this._generateMessage(Cannot._config.stackActive);
// });
