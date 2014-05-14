/*!
 * Cannot.js
 * Easy and fun error handling, by enforcing human readable messages without compromising machine processing ability.
 * Copyright(c) 2013 Sebastian Herrlinger (https://github.com/kommander)
 * MIT Licensed
 */

(function(module, global){

  // Get global settings for module setup
  var config = (this.global && this.global.__cannotConfig) || {};

  /**
   * Create a Cannot error instance.
   * May be used as a method or instantiated with the `new` keyword.
   *
   * @param {String} action
   * @param {String} subject
   * @param {String|Cannot|Object|...} reason
   * @return {Cannot}
   * @api public
   */
  var Cannot = function(action, subject, reason, methodUse){
    if(!(this instanceof Cannot)){
      return new Cannot(action, subject, reason, true);
    }

    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    // Set a creation timestamp
    this.createdAt = Date.now();

    this._action = action;
    this._subject = subject;
    // Set reason with the setter, so it is checked to be a Cannot instance
    this.reason = reason;
    
    // Enforce full arguments to be consitent
    if(!this._action || !this._subject){
      throw Cannot('create', 'exception', 'action or subject is missing');
    }

    this._methodUse = methodUse;

    this.id = ++Cannot._count;
    this._unhandle(true);

    // Invoke creation hooks if available
    if(Cannot._createHooks){
      for(var i = 0; i < Cannot._createHooks.length; i++) {
        process.nextTick(Cannot._createHooks[i].bind(this));
      }
    }
  }

  // Extend error
  Cannot.prototype.__proto__ = Error.prototype;

  Cannot.prototype.name = 'Exception';
  Cannot.prototype.handled = false;

  // Default throw timeout
  Cannot._count = 0;
  Cannot._unhandled = [];
  Cannot._all = {};

  // Global Cannot Exception settings
  Cannot._timeout = config.timeout || 3000;
  Cannot.prefix = config.prefix || 'cannot';
  Cannot.stackActive = typeof config.stackActive !== 'undefined' ? config.stackActive : true;
  Cannot.stackDefault = typeof config.stackDefault !== 'undefined' ? config.stackDefault : false;
  Cannot.exitStack = typeof config.exitStack !== 'undefined' ? config.exitStack : false;
  Cannot.object = config.object || 'I';
  Cannot.extendObject = typeof config.extendObject !== 'undefined' ? config.extendObject : true;
  Cannot.catchMethodName = config.catchMethodName || 'inform';
  Cannot.automaticHandle = typeof config.automaticHandle !== 'undefined' ? config.automaticHandle : true;;
  
  // Try to define non enumerable properties
  if(typeof Object.defineProperties === 'function'){
    
    var _stack;
    Object.defineProperty(Cannot.prototype, '_stack', {
      get : function(){ return _stack; },
      set : function(newValue){ _stack = newValue; },
      configurable: true
    });
    
  }

  /**
   * Get a stack trace array, default for node.
   * Override this method with a stacktrace method for browser usage
   *
   * @api private
   */
  Cannot.prototype._getStack = function(){
    // Generate and store stack
    if(Cannot.stackActive && !this._hasStack){
      this._hasStack = true;
      var lines = this.stack.split('\n');
      var reduceBy = this._methodUse ? 2 : 1;
      lines.splice(0, reduceBy);
      this._stack = lines;
      this._info = Cannot.parseTraceLine(lines[0]);

      return lines;    
    }
  }

  /**
   * Reduce a string to a codified one by replacing whitespace and special chars to underscores
   *
   * @param {String} str
   * @return {String}
   * @api public
   */
  Cannot.codify = function(str) {
    return str.replace(/[^A-Za-z0-9]{1,100}/igm, '_').toLowerCase();
  }

  /**
   * Parse the filename, path, and line number from a V8 exception stack trace line
   *
   * @param {String} line
   * @return {Object} Collected information from the stack trace line
   * @api public
   */
  Cannot.parseTraceLine = function(line){
    var split = line.split('/');
    var lastSplit = split[split.length - 1];
    var at = null;

    if(line.match(/at\s.*\s\(/ig)){
      at = line.slice(line.indexOf('at ') + 3, line.indexOf(' ('));
    }
    // TODO: parse path correctly if we have a stack trace line without method name (anonymous function)

    var info = {
      at: at,
      path: line.slice(line.indexOf('(') + 1, line.lastIndexOf('/') + 1),
      filename: lastSplit.slice(0, lastSplit.indexOf(':')),
      line: parseInt(lastSplit.slice(lastSplit.indexOf(':') + 1, lastSplit.lastIndexOf(':')), 10),
      column: parseInt(lastSplit.slice(lastSplit.lastIndexOf(':') + 1, lastSplit.lastIndexOf(')')), 10)
    }
    return info;
  }

  /**
   * Consolidate a string from unhandled Cannots
   *
   * @api private
   */
  Cannot._unhandledToString = function(stack){
    var str = [];
    this._handling = true;
    for(var i = 0; i < this._unhandled.length; i++){
      var index = i + 1;
      var ex = this._all[Cannot._unhandled[i]];
      str.push(index);
      str.push('.: ');
      str.push(ex._generateMessage(stack));
      if(index < this._unhandled.length){
        str.push('\n');
      }
    }
    while(this._unhandled.length > 0){
      this._all[Cannot._unhandled[0]]._handle();
    }
    this._handling = false;
    return str.join('');
  }

  /**
   * A human readable message from the Cannot data, optionally including stack trace info (if Cannot.stackActive == true)
   *
   * Example:
   * Cannot('load', 'User').because('the connection was lost').message 
   * // -> I could not load User at user.js line 23, because the connection was lost.
   *
   * @return {Sring}
   * @api public
   */
  Cannot.prototype.__defineGetter__('message', function() {
    Cannot.automaticHandle && this._handle();
    return this._generateMessage(Cannot.stackActive && Cannot.stackDefault);
  });

  /**
   * A human readable message from the Cannot data.
   * This method only provides the expected output (message with stack info), if Cannot.stackActive == true.
   *
   * @api public
   */
  Cannot.prototype.__defineGetter__('stackMessage', function() {
    Cannot.automaticHandle && this._handle();
    return this._generateMessage(Cannot.stackActive);
  });

  /**
   * Attempt to generate a meaningful error message
   * Get message optionally with or without stack trace by specifying the stack argument.
   * TODO: Improve string concatenation with array join
   *
   * @api private
   */
  Cannot.prototype._generateMessage = function(stack){
    if (!this._message || this._stackBefore != stack){
      
      this._getStack();

      this._message = (this._timedOut ? 'Earlier, ' : '') 
        + this.object + ' could not ' + this._action + ' ' + this._subject;

      if(!stack && Cannot.stackActive && typeof this._info == 'object'){
        this._message += ' at ' + this._info.filename + ' on line ' + this._info.line;
      }
      
      if (this._reason) {
        if(this._infoStr) {
          this._message += ' (' + this._infoStr + ')';
        }
        if (this._reason instanceof Cannot){
          if(stack) {
            this._reason._stack.unshift(this._stack[0]);
          }
          this._message += ', because ' + this._reason;
        } else {
          var text = this._reason.code || this._reason.message || this._reason.toString();
          
          this._message += ', because ' + text + '.';
          stack && (this._message += '\n' + this._stack.join("\n"));
        }
        this._stackBefore = stack;
      } else {
        this._message += '. (No reason)';
        if(this._infoStr) {
          this._message += ' (' + this._infoStr + ')';
        }
      }
    } 

    // Make sure we include unhandled messages, but not itself if we handle explicitly
    var limit = 0;
    if(!Cannot.automaticHandle && !this.handled){
      limit = 1;
    }

    if(Cannot._unhandled.length > limit && !Cannot._handling){
      this._message += '\nAlso, ' + Cannot.object + ' Found unhandled Exceptions:\n' + Cannot._unhandledToString(stack);
    }

    return this._message;
  }

  /**
   * Get the action/verb property, conside the Cannot to be handled
   *
   * Example:
   * Cannot('load', 'User').because('connection was lost').action // -> load
   *
   * @return {String}
   * @api public
   */
  Cannot.prototype.__defineGetter__('action', function() {
    Cannot.automaticHandle && this._handle();
    return Cannot.codify(this._action);
  });

  /**
   * Get the code property value and consider the Cannot handled
   *
   * Example:
   * Cannot('load', 'User').because('connection was lost').code // -> load_user
   *
   * @return {String}
   * @api public
   */
  Cannot.prototype.__defineGetter__('code', function() {
    Cannot.automaticHandle && this._handle();
    if(!this._code){
      this._code = [Cannot.codify(this._action), Cannot.codify(this._subject)];
      if(Cannot.prefix){
        this._code.unshift(Cannot.prefix);
      }
      this._code = this._code.join('_');
    }
    return this._code;
  });

  /**
   * Get the subject property value and consider the Cannot handled
   *
   * Example:
   * Cannot('load', 'User').because('connection was lost').subject // -> user
   *
   * @return {String}
   * @api public
   */
  Cannot.prototype.__defineGetter__('subject', function() {
    Cannot.automaticHandle && this._handle();
    return Cannot.codify(this._subject);
  });

  /**
   * Get the formulated reason for the exception, consider the Cannot handled
   *
   * Example:
   * Cannot('load', 'User').because('connection was lost').reason // -> connection_was_lost
   *
   * @return {String}
   * @api public
   */
  Cannot.prototype.__defineGetter__('reason', function() {
    Cannot.automaticHandle && this._handle();
    var reason;
    if(typeof this._reason === 'string'){
      reason = Cannot.codify(this._reason);
    } else {
      reason = this._reason.code ? this._reason.code : this._reason;
    }
    return reason;
  });

  /**
   * Set the reason, but only if it was not set already to prevent it being overwritten.
   *
   * @api public
   */
  Cannot.prototype.__defineSetter__('reason', function(reason) {
    if(!reason){
      return;
    }

    if(this._reason){
      throw Cannot('overwrite', 'Reason');
    }
    
    // When stacking a Cannot error, it will be handled withing, so consider it handled
    if(reason instanceof Cannot){
      reason._handle();
    }

    this._reason = reason;
  });

  /**
   * Object
   *
   * @return {String}
   * @api public
   */
  Cannot.prototype.__defineGetter__('object', function() {
    if(!this._object){
      this._object = (this._info && this._info.at) || Cannot.object;
    }
    return this._object;
  });

  /**
   * Object
   *
   * @api public
   */
  Cannot.prototype.__defineSetter__('object', function(object) {
    this._object = object;
  });

  /**
   * Set reason with 'because' method chaining
   *
   * Example:
   * var err = Cannot('load', 'User').because('connection was lost');
   *
   * @return {Cannot} for chaining
   * @api public
   */
  Cannot.prototype.because = function(reason) {
    this.reason = reason;
    return this;
  };

  /**
   * Set additional info
   *
   * Example:
   * var err = Cannot('load', 'User').info('additional stuff');
   *
   * @return {Cannot} for chaining
   * @api public
   */
  Cannot.prototype.info = function(infoStr) {
    this._infoStr = infoStr;
    return this;
  };

  /**
   * Set additional data to be handed further with the exception object
   *
   * Example:
   * var err = Cannot('load', 'User').data({ some: 'value' });
   *
   * @return {Object} Returns the set data
   * @api public
   */
  Cannot.prototype.addData = function(data) {
    if(data){
      this._data = data;
    }
    return this;
  };

  /**
   * Data
   *
   * @return {Object|null}
   * @api public
   */
  Cannot.prototype.__defineGetter__('data', function() {
    return this._data ? this._data : null;
  });

  /**
   * Mark the Exception as not handled
   *
   * @api public
   */
  Cannot.prototype.unhandle = function() {
    this._unhandle();
  };

  /**
   * Internal marker
   *
   * @api private
   */
  Cannot.prototype._unhandle = function(force) {
    if(!this.handled || force){
      Cannot._setTimeout();
      Cannot._unhandled.push(this.id);
      Cannot._all[this.id] = this;
      this.handled = false;
    }
  };

  /**
   * Set global timeout to check for unhandled errors
   */ 
  Cannot._setTimeout = function(time){
    if(!Cannot._throwTimeout){
      Cannot._throwTimeout = setTimeout(function(){
        // Check if we have unhandled in queue
        if(Cannot._unhandled.length > 0){
          // Check first in queue
          var first = Cannot._all[Cannot._unhandled[0]];
          var delta = Date.now() - first.createdAt;
          if(delta >= Cannot._timeout){
            first._throw();
            return;
          }
          Cannot._setTimeout(delta);
          return;
        }
        Cannot._throwTimeout = null;
      }, time || Cannot._timeout);
    }
  };

  /**
   * Throw this exception (In its own method for testing purposes)
   *
   * @api private
   */
  Cannot.prototype._throw = function () {
    throw this; 
  };

  /**
   * Mark the Exception as handled
   *
   * @api public
   */
  Cannot.prototype.handle = function() {
    this._handle();
  };

  /**
   * Mark the Exception as handled
   *
   * @api private
   */
  Cannot.prototype._handle = function() {
    if(!this.handled){
      delete Cannot._all[this.id];
      var index = Cannot._unhandled.indexOf(this.id);
      if(index != -1) {
        Cannot._unhandled.splice(index, 1);
      }
      this.handled = true;

      // If there is nothing to handle anymore, clear global timeout
      if(Cannot._unhandled.length == 0){
        clearTimeout(Cannot._throwTimeout);
        Cannot._throwTimeout = null;
      }
    }
  };

  /**
   * Return a string representation of this Cannot
   *
   * @api public
   */
  Cannot.prototype.toString = function(){
    return this.message;
  }

  /**
   * Add a hook that is called whenever a Cannot is created
   *
   * @param {Function} fn The callback for the hook function(err), will get executed in context of the newly created Cannot instance
   * @api public
   */
  Cannot.createHook = function(fn){
    if(!this._createHooks){
      this._createHooks = [];
    }
    this._createHooks.push(fn);
  }

  /**
   * Callback for process exit/window close.
   * Checks for unhandled exceptions and informs about them.
   *
   * @api private
   */
  function exit(exitCode){
    if(Cannot._unhandled.length > 0 && exitCode === 0){
      var ex = {
        name: 'Error',
        message: Cannot.object + ' found unhandled Exceptions:\n' 
          + Cannot._unhandledToString(Cannot.stackDefault || Cannot.exitStack)
      };
      throw ex;
    }
  }

  // Attach the exit callback
  if(typeof process !== 'undefined'){
    process.on('exit', exit);
  }

  /**
   * Add a listener to the object/constructor for cannots,
   * with ability to select to listen for certain actions or action/subject combinations only.
   *
   * Example:
   * db1.inform('load', 'user', function(err){
   *   // err = Cannot instance
   * });
   * db1.cannot('load', 'User');
   *
   * TODO: Allow listening to a specific subject only for every action
   * TODO: Create combinations from action/subject array specify a listener for a set of actions and subjects
   * TODO: Remove a specific listener, remove all listeners, remove all listeners for an action/subject combination
   *
   * @api public
   */
  var inform = function(action, subject, fn){

    if(!this.__cannotListener){
      this.__cannotListener = [];
      this.__cannotListener.actions = {};
      this.__cannotListener.actionSubjects = {};
    }

    // Normal listener, catching all cannots
    if(typeof action === 'function'){  
      this.__cannotListener.push(action);
      return;
    }

    // action listener, only catching certain action exceptions
    if(typeof action === 'string' && typeof subject === 'function'){
      var codifiedAction = Cannot.codify(action);
      if(!this.__cannotListener.actions[codifiedAction]) {
        this.__cannotListener.actions[codifiedAction] = [];
      }
      this.__cannotListener.actions[codifiedAction].push(subject);
      return;
    }

    // action/subject combination listener, only catching certain action/subject combinations
    if(typeof action === 'string' && typeof subject === 'string' && typeof fn === 'function'){
      var codifiedActionSubject = Cannot.codify(action) + Cannot.codify(subject);
      if(!this.__cannotListener.actionSubjects[codifiedActionSubject]) {
        this.__cannotListener.actionSubjects[codifiedActionSubject] = [];
      }
      this.__cannotListener.actionSubjects[codifiedActionSubject].push(fn);
      return;
    }

    throw this.cannot('inform about', 'exceptions').because('argument combination is unknown');
  }

  // Execute later, how?
  var nextTick = module ? process.nextTick : setTimeout;

  /**
   * Expose API via #Object.cannot
   * Create a Cannot Exception from an object directly with the same arguments the Cannot constructor takes.
   *
   * Example:
   * var err = mongoose.cannot('load', 'User').because('connection was lost');
   *
   * @return {Cannot}
   * @api public
   */
  var cannot = function(action, subject, reason){
    var ex = new Cannot(action, subject, reason, true);

    // Set the object name if possible
    var objName = this.constructor.name;
    if(objName) {
      ex.object = objName;
    }

    // Store a reference to the object we invoked the Cannot on
    ex.context = this;

    // Invoke the cannot callbacks, locally and globally
    this.__cannot(this, ex);
    this.constructor.__cannot(this, ex);

    return ex;
  }

  /**
   * Invoke listeners for a created Cannot instance on an object
   *
   * @api private
   */
  __cannot = function(instance, ex){

    // Do we have any listener at all?
    if(this.__cannotListener){
      // Invoke all listeners
      for(var i = 0; i < this.__cannotListener.length; i++){
        nextTick(this.__cannotListener[i].bind(this, ex, instance));
      }

      // Invoke callbacks for specific action
      // TODO: When using the action/subject properties, the exceptions is marked as handled immediately after creation
      //       and will never timeout and be thrown if not really handled
      var actionListeners = this.__cannotListener.actions[ex.action];
      if(actionListeners){
        for(var i = 0; i < actionListeners.length; i++){
          nextTick(actionListeners[i].bind(this, ex, instance));
        }
      }

      // Invoke callbacks for specific action/subject combination
      var actionSubject = ex.action + ex.subject;
      var actionSubjectListeners = this.__cannotListener.actionSubjects[actionSubject];
      if(actionSubjectListeners){
        for(var i = 0; i < actionSubjectListeners.length; i++){
          nextTick(actionSubjectListeners[i].bind(this, ex, instance));
        }
      }

    }

  };

  // Only extend the Object prototype if wanted
  if(Cannot.extendObject === true){

    // Try to safely extend Object prototype
    if(typeof Object.defineProperties === 'function'){
      if(!Object.prototype.cannot){
        Object.defineProperty(Object.prototype, 'cannot', {
          value: cannot,
          configurable: false
        });
        Object.defineProperty(Object.prototype, '__cannot', {
          value: __cannot,
          configurable: false
        });
        Object.defineProperty(Object.prototype, Cannot.catchMethodName, {
          value: inform,
          configurable: false
        });
      }
    } else {
      Object.prototype.cannot = cannot;
      Object.prototype[Cannot.catchMethodName] = inform;
      Object.prototype.__cannot = __cannot;
    }

  }

  // Export
  if(module){
    module.exports = Cannot;
  } else {
    // Deactivate stack info for browser usage
    Cannot.stackActive = false;
    Cannot.stackDefault = false;
    Cannot.exitStack = false;

    global.Cannot = Cannot;
  }

})('object' === typeof module ? module : null, this);