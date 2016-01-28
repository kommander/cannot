//
// Not yet an extension, just factoring out stuff...
//

//
// README EXTRACTION
//

// To support this, _cannot.js_ considers newly created errors as _unhandled_ and expects them to be handled in time, otherwise it will throw the error. This allows us to discover unhandled errors earlier and helps preventing errors from being dropped silently.

// Currently, _cannot.js_ gives an error a certain amount of time to be handled, which defaults to _3 seconds_.  
// An error is considered _handled_ whenever a major attribute of it is used (code, action, subject, reason, message). Future versions might withdraw the auto-handling and force you to mark errors as handled explicitly to avoid it being thrown.


// /**
//  * Set global timeout to check for unhandled errors
//  */ 
// Cannot._setTimeout = function(time){
//   if(!Cannot._throwTimeout){
//     Cannot._throwTimeout = setTimeout(function(){
//       // Check if we have unhandled in queue
//       if(Cannot._unhandled.length > 0){ 
//         // Check first in queue
//         var first = Cannot._all[Cannot._unhandled[0]];
//         var delta = Date.now() - first.createdAt;
//         if(delta >= Cannot._config.timeout){
//           first._throw();
//           return;
//         }
//         Cannot._setTimeout(delta);
//         return;
//       }
//       Cannot._throwTimeout = null;
//     }, time || Cannot._config.timeout);
//   }
// };

// /**
//  * Throw this exception (In its own method for testing purposes)
//  *
//  * @api private
//  */
// Cannot.prototype._throw = function () {
//   throw this; 
// };

// // Execute later, how?
// var nextTick = module ? process.nextTick : setTimeout;
