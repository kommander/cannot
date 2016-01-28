//
// Not yet an extension, just factoring out stuff...
//


// README EXTRACTION
//
//

// ```javascript  
// var err = Alice.cannot('attend', 'the party').because('she fell into a rabbit hole');  
// // err.message       -> {String} "Alice could not attend the party, because she fell into a rabbit hole."  
// // err.object        -> {String} "Alice"  
// // err.code          -> {String} "cannot_attend_the_party"  
// // err.action        -> {String} "attend"  
// // err.subject       -> {String} "the_party"  
// // err.reason        -> {String} "she_fell_into_a_rabbit_hole"
// // err.context       -> {Object} Alice
// ```

// So how is that applicable to a real world programming example?  

// ```javascript
// var db = new Database();

// var err = db.cannot('load', 'User').because('connection was lost');
// // err.message       -> {String} "Database could not load User, because connection was lost."  
// // err.object        -> {String} "Database"  
// // err.code          -> {String} "cannot_load_user"  
// // err.action        -> {String} "load"  
// // err.subject       -> {String} "user"  
// // err.reason        -> {String} "connection_was_lost"
// // err.context       -> {Object} db
// ```


// ## Inform  
// With `cannot.js` an object and even its constructor can `inform` you whenever it `cannot` perform and action.
// You can listen on any object with the `Object#inform` method for failures.

// ### Be informed by an object instance

// ```javascript  
// var db = new Database();

// db.inform(function(err){
//   // err -> "Database cannot load User because connection was lost"
// });

// db.cannot('load', 'User').because('connection was lost');
// ```

// ### Be informed by an object constructor
// ```javascript  
// Database.inform(function(err, instance){
//   // err.context -> {Object} db1
//   // err.context -> {Object} db2
// });

// var db1 = new Database();
// var db2 = new Database();

// db1.cannot('load', 'User');
// db2.cannot('load', 'User');
// ```

// ### Emit an 'error' event 
// With a `createHook` we can extend the behaviour of the error handling. By specifying the following hook we can emit an "error" event directly on the object, if it is an EventEmitter.

// ```javascript
// Cannot.createHook(function(){
//   // Emit error event
//   if(this.context && this.context instanceof EventEmitter){
//     this.context.emit('error', this);
//   }
// });
// ```

// Now we can use existing error listeners or classic event handling for errors:

// ```javascript  
// function Database(…){
//   // …
// }
// Database.prototype.__proto__ = EventEmitter.prototype;

// var db = new Database();

// db.on("error", function(err){
//   // err -> "Database cannot load User. (No reason)"
// });

// db.cannot('load', 'User');
// ```

// ### Listen for specific action/subject combinations
// The `inform` method allows you to listen for a specific action only and even more: a specific subject.  
  
// So lets say you want to handle an error from your database instance whenever a "save" action fails, but you want to handle "load" errors separately:

// ```javascript  
// db.inform("save", function(err){
//   // err -> "Database could not save User. (No reason)"
//   // Will _not_ receive the second error with the "load" action
// });

// db.cannot('save', 'User');
// db.cannot('load', 'User');
// ```

// To only listen for a specific action/subject combination, add the subject of interest as second argument. Internally, the action and subject descriptions are codified and therefor case insensitive.

// ```javascript  
// db.inform("save", "user", function(err){
//   // err -> "Database could not save User. (No reason)"
//   // Will _not_ receive the second error with the "Profile" subject
// });

// db.cannot('save', 'User');
// db.cannot('save', 'Profile');
// ```


// // Invoke creation hooks if available
// if(Cannot._createHooks){
//   for(var i = 0; i < Cannot._createHooks.length; i++) {
//     process.nextTick(Cannot._createHooks[i].bind(this));
//   }
// }

// /**
//  * Add a listener to the object/constructor for cannots,
//  * with ability to select to listen for certain actions or action/subject combinations only.
//  *
//  * Example:
//  * db1.inform('load', 'user', function(err){
//  *   // err = Cannot instance
//  * });
//  * db1.cannot('load', 'User');
//  *
//  * TODO: Allow listening to a specific subject only for every action
//  * TODO: Create combinations from action/subject array specify a listener for a set of actions and subjects
//  * TODO: Remove a specific listener, remove all listeners, remove all listeners for an action/subject combination
//  *
//  * @api public
//  */
// function inform(action, subject, fn){

//   if(!this.__cannotListener){
//     this.__cannotListener = [];
//     this.__cannotListener.actions = {};
//     this.__cannotListener.actionSubjects = {};
//   }

//   // Normal listener, catching all cannots
//   if(typeof action === 'function'){  
//     this.__cannotListener.push(action);
//     return;
//   }

//   // action listener, only catching certain action exceptions
//   if(typeof action === 'string' && typeof subject === 'function'){
//     var codifiedAction = Cannot.codify(action);
//     if(!this.__cannotListener.actions[codifiedAction]) {
//       this.__cannotListener.actions[codifiedAction] = [];
//     }
//     this.__cannotListener.actions[codifiedAction].push(subject);
//     return;
//   }

//   // action/subject combination listener, only catching certain action/subject combinations
//   if(typeof action === 'string' && typeof subject === 'string' && typeof fn === 'function'){
//     var codifiedActionSubject = Cannot.codify(action) + Cannot.codify(subject);
//     if(!this.__cannotListener.actionSubjects[codifiedActionSubject]) {
//       this.__cannotListener.actionSubjects[codifiedActionSubject] = [];
//     }
//     this.__cannotListener.actionSubjects[codifiedActionSubject].push(fn);
//     return;
//   }

//   throw this.cannot('inform about', 'exceptions').because('argument combination is unknown');
// }


// /**
//  * Expose API via #Object.cannot
//  * Create a Cannot Exception from an object directly with the same arguments the Cannot constructor takes.
//  *
//  * Example:
//  * var err = mongoose.cannot('load', 'User').because('connection was lost');
//  *
//  * @return {Cannot}
//  * @api public
//  */
// function apiCannot(action, subject, reason){
//   var ex = new Cannot(action, subject, reason, true);

//   // Set the object name if possible
//   var objName = this.constructor.name;
//   if(objName) {
//     ex.object = objName;
//   }

//   // Store a reference to the object we invoked the Cannot on
//   ex.context = this;

//   // Invoke the cannot callbacks, locally and globally
//   this.__cannot(this, ex);
//   this.constructor.__cannot(this, ex);

//   return ex;
// }

// /**
//  * Invoke listeners for a created Cannot instance on an object
//  *
//  * @api private
//  */
// __cannot = function(instance, ex){

//   // Do we have any listener at all?
//   if(this.__cannotListener){
//     // Invoke all listeners
//     for(var i = 0; i < this.__cannotListener.length; i++){
//       nextTick(this.__cannotListener[i].bind(this, ex, instance));
//     }

//     // Invoke callbacks for specific action
//     // TODO: When using the action/subject properties, the exceptions is marked as handled immediately after creation
//     //       and will never timeout and be thrown if not really handled
//     var actionListeners = this.__cannotListener.actions[ex.action];
//     if(actionListeners){
//       for(var i = 0; i < actionListeners.length; i++){
//         nextTick(actionListeners[i].bind(this, ex, instance));
//       }
//     }

//     // Invoke callbacks for specific action/subject combination
//     var actionSubject = ex.action + ex.subject;
//     var actionSubjectListeners = this.__cannotListener.actionSubjects[actionSubject];
//     if(actionSubjectListeners){
//       for(var i = 0; i < actionSubjectListeners.length; i++){
//         nextTick(actionSubjectListeners[i].bind(this, ex, instance));
//       }
//     }

//   }

// };

// // Only extend the Object prototype if wanted
// if(Cannot._config.extendObject === true){

//   // Try to safely extend Object prototype
//   if(typeof Object.defineProperties === 'function'){
//     if(!Object.prototype.cannot){
//       Object.defineProperty(Object.prototype, 'cannot', {
//         value: apiCannot,
//         configurable: false
//       });
//       Object.defineProperty(Object.prototype, '__cannot', {
//         value: __cannot,
//         configurable: false
//       });
//       Object.defineProperty(Object.prototype, Cannot._config.catchMethodName, {
//         value: inform,
//         configurable: false
//       });
//     }
//   } else {
//     Object.prototype.cannot = apiCannot;
//     Object.prototype[Cannot._config.catchMethodName] = inform;
//     Object.prototype.__cannot = __cannot;
//   }

// }

// /**
//  * Add a hook that is called whenever a Cannot is created
//  *
//  * @param {Function} fn The callback for the hook function(err), will get executed in context of the newly created Cannot instance
//  * @api public
//  */
// Cannot.createHook = function(fn){
//   if(!this._createHooks){
//     this._createHooks = [];
//   }
//   this._createHooks.push(fn);
// }
