/*!
 * Cannot.js
 * Easy and fun error handling, by enforcing human readable messages without compromising machine processing ability.
 * Copyright(c) 2013 Sebastian Herrlinger (https://github.com/kommander)
 * MIT Licensed
 */

(function(module, global){

  // Dependencies for node version
  if(module) {
    var EventEmitter = require('events').EventEmitter;
  }

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

    this._action = action;
    this._subject = subject;
    this._reason = reason;

    // Enforce full arguments to be consitent
    if(!this._action || !this._subject){
      throw Cannot('handle', 'exception', 'arguments are missing');
    }

    // If the cause is a Cannot it will be handled within this instance
    if(this._reason instanceof Cannot){
      this._reason._handle();
    }

    // exception location info
    if(Cannot.stackActive){
      this._stack = this._getStack(methodUse);
      this.info = Cannot.parseTraceLine(this._stack[0]);
    }

    this.object = (this.info && this.info.at) || Cannot.object;
    
    this.id = ++Cannot._count;
    this._unhandle(true);
  }

  Cannot.prototype.name = 'Exception';
  Cannot.prototype.handled = false;

  // Default throw timeout
  Cannot._timeout = 3000;
  Cannot._count = 0;
  Cannot._unhandled = [];
  Cannot._all = {};

  // Global Cannot Exception settings
  Cannot.prefix = 'cannot';
  Cannot.stackActive = true;
  Cannot.stackDefault = false;
  Cannot.exitStack = false;
  Cannot.object = 'I';
  Cannot.catchMethodName = 'inform';
  Cannot.emitErrorEvent = true;
  
  /**
   * Get a stack trace array, default for node.
   * Override this method with a stacktrace method for browser usage
   *
   * @api private
   */
  Cannot.prototype._getStack = function(methodUse){
    // Generate and store stack
    var err = new Error();
    var lines = err.stack.split('\n');
    var reduceBy = methodUse ? 4 : 3;
    lines.splice(0, reduceBy);
    return lines;    
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
    var info = {
      at: line.slice(line.indexOf('at ') + 3, line.indexOf(' (')),
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
    this._handle();
    return this._generateMessage(Cannot.stackActive && Cannot.stackDefault);
  });

  /**
   * A human readable message from the Cannot data.
   * This method only provides the expected output (message with stack info), if Cannot.stackActive == true.
   *
   * @api public
   */
  Cannot.prototype.__defineGetter__('stackMessage', function() {
    this._handle();
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
      
      this._message = (this._timedOut ? 'Earlier, ' : '') 
        + this.object + ' could not ' + this._action + ' ' + this._subject;

      !stack && (this._message += Cannot.stackActive ? ' at ' + this.info.filename + ' on line ' + this.info.line : '');
      
      if (this._reason) {
        if (this._reason instanceof Cannot){
          if(stack) {
            this._reason._stack.unshift(this._stack[0]);
          }
          this._message += '\n    because ' + this._reason;
        } else {
          var text = this._reason.code || this._reason.message || this._reason.toString();
          this._message += ', because ' + text + '.';
          stack && (this._message += '\n' + this._stack.join("\n"));
        }
        this._stackBefore = stack;
      } else {
        this._message += '. (No reason)';
      }
    }
    
    if(Cannot._unhandled.length > 0 && !Cannot._handling){
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
    this._handle();
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
    this._handle();
    if(!this._code){
      this._code = [Cannot.codify(this._action), Cannot.codify(this._subject)];
      if(Cannot.prefix){
        this.code.unshift(Cannot.prefix);
      }
      this._code = this._code.join('_');
    }
    return this._code;
  });

  /**
   * Get the subject property value and consider the Cannot handled
   *
   * Example:
   * Cannot('load', 'User').because('connection was lost').code // -> user
   *
   * @return {String}
   * @api public
   */
  Cannot.prototype.__defineGetter__('subject', function() {
    this._handle();
    return Cannot.codify(this._subject);
  });

  /**
   * Get the formulated reason for the exception, consider the Cannot handled
   *
   * Example:
   * Cannot('load', 'User').because('connection was lost').code // -> connection_was_lost
   *
   * @return {String}
   * @api public
   */
  Cannot.prototype.__defineGetter__('reason', function() {
    this._handle();
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
    if(this._reason){
      throw Cannot('overwrite', 'Reason');
    }
    this._reason = reason;
  });

  /**
   * Set reason with 'because' method chaining
   *
   * Example:
   * var err = Cannot('load', 'User').because('connection was lost');
   *
   * @return {String}
   * @api public
   */
  Cannot.prototype.because = function(reason) {
    this.reason = reason;
    return this;
  };

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
    if(this.handled || force){
      var self = this;
      this._throwTimeout = setTimeout(function(){
        self._timedOut = true;
        self._throw();
      }, Cannot._timeout);
      
      Cannot._unhandled.push(this.id);
      Cannot._all[this.id] = this;

      this.handled = false;
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
      clearTimeout(this._throwTimeout);
      delete Cannot._all[this.id];
      var index = Cannot._unhandled.indexOf(this.id);
      if(index != -1) {
        Cannot._unhandled.splice(index, 1);
      }
      this.handled = true;
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

    // Emit error event if wanted
    if(Cannot.emitErrorEvent && this instanceof EventEmitter){
      this.emit('error', ex);
    }

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

  // Export
  if(module){
    module.exports = Cannot;
  } else {
    // Deactivate stack info for browser usage
    Cannot.stackActive = false;
    Cannot.stackDefault = false;
    Cannot.exitStack = false;

    // Deactivate error event emitting on object for browser usage
    Cannot.emitErrorEvent = false;

    global.Cannot = Cannot;
  }

})('object' === typeof module ? module : null, this);