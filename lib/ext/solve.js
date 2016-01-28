//
// Not yet an extension, just factoring out stuff...
//

//
// Provide enforced error handling as extension with err.solve('how')
//

// /**
//  * Consolidate a string from unhandled Cannots
//  *
//  * @api private
//  */
// Cannot._unhandledToString = function(stack){
//   var str = [];
//   this._handling = true;
//   for(var i = 0; i < this._unhandled.length; i++){
//     var index = i + 1;
//     var ex = this._all[Cannot._unhandled[i]];
//     str.push(index);
//     str.push('.: ');
//     str.push(ex._generateMessage(stack));
//     if(index < this._unhandled.length){
//       str.push('\n');
//     }
//   }
//   while(this._unhandled.length > 0){
//     this._all[Cannot._unhandled[0]]._handle();
//   }
//   this._handling = false;
//   return str.join('');
// }

// // Cannot._config.automaticHandle && this._handle();
 
// // Make sure we include unhandled messages, but not itself if we handle explicitly
// var limit = 0;
// if(!Cannot._config.automaticHandle && !this.handled){
// limit = 1;
// }

// if(Cannot._unhandled.length > limit && !Cannot._handling){
// this._message += '\nAlso, ' + Cannot._config.object + ' Found unhandled Exceptions:\n' + Cannot._unhandledToString(stack);
// }

// /**
//  * Mark the Exception as not handled
//  *
//  * @api public
//  */
// Cannot.prototype.unhandle = function() {
//   this._unhandle();
// };

// /**
//  * Internal marker
//  *
//  * @api private
//  */
// Cannot.prototype._unhandle = function(force) {
//   if(!this.handled || force){
//     Cannot._setTimeout();
//     Cannot._unhandled.push(this.id);
//     Cannot._all[this.id] = this;
//     this.handled = false;
//   }
// };

// /**
//  * Mark the Exception as handled
//  *
//  * @api public
//  */
// Cannot.prototype.handle = function() {
//   this._handle();
// };

// /**
//  * Mark the Exception as handled
//  *
//  * @api private
//  */
// Cannot.prototype._handle = function() {
//   if(!this.handled){
//     delete Cannot._all[this.id];
//     var index = Cannot._unhandled.indexOf(this.id);
//     if(index != -1) {
//       Cannot._unhandled.splice(index, 1);
//     }
//     this.handled = true;

//     // If there is nothing to handle anymore, clear global timeout
//     if(Cannot._unhandled.length == 0){
//       clearTimeout(Cannot._throwTimeout);
//       Cannot._throwTimeout = null;
//     }
//   }
// };

// /**
//  * Callback for process exit/window close.
//  * Checks for unhandled exceptions and informs about them.
//  *
//  * @api private
//  */
// function exit(exitCode){
//   if(Cannot._unhandled.length > 0 && exitCode === 0){
//     var ex = {
//       name: 'Error',
//       message: Cannot._config.object + ' found unhandled Exceptions:\n' 
//         + Cannot._unhandledToString(Cannot._config.stackDefault || Cannot._config.exitStack)
//     };
//     throw ex;
//   }
// }

// // Attach the exit callback
// if(typeof process !== 'undefined'){
//   process.on('exit', exit);
// }

