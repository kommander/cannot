/*!
 * Cannot.js
 * Easy and fun error handling, by enforcing human readable messages without compromising machine processing ability.
 * Copyright(c) Sebastian Herrlinger (https://github.com/kommander)
 * MIT Licensed
 */

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
function Cannot(action, subject, reason, methodUse){
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
  
  // Enforce full arguments to be consistent
  if(!this._action || !this._subject){
    throw Cannot('create', 'exception', 'action or subject is missing');
  }

  this.id = ++Cannot._count;
}

// Extend error
Cannot.prototype.__proto__ = Error.prototype;

Cannot.prototype.name = 'Exception';
Cannot.prototype.handled = false;

module.exports = Cannot;

// Instance counter
Cannot._count = 0;

// Global Cannot Error handling settings
Cannot.config = function( config ) {
  for(var k in config){
    this._config[k] = config[k];
  }
}

// Default settings
Cannot._config = {
  prefix: 'cannot',
  object: 'I'
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
 * A human readable message from the Cannot data
 *
 * Example:
 * Cannot('load', 'User').because('the connection was lost').message 
 * // -> I could not load User, because the connection was lost.
 *
 * @return {Sring}
 * @api public
 */
Cannot.prototype.__defineGetter__('message', function() {
  return this._generateMessage();
});

/**
 * Attempt to generate a meaningful error message
 * TODO: Improve string concatenation with array join
 *
 * @api private
 */
Cannot.prototype._generateMessage = function(stack){
  if (!this._message){
    
    this._message = this.object + ' could not ' + this._action + ' ' + this._subject;

    if (this._reason) {
      if(this._infoStr) {
        this._message += ' (' + this._infoStr + ')';
      }
      if (this._reason instanceof Cannot){
        this._message += ', because ' + this._reason;
      } else {
        var text = this._reason.code || this._reason.message || this._reason.toString();
        
        this._message += ', because ' + text + '.';
      }
    } else {
      this._message += '. (No reason)';
      if(this._infoStr) {
        this._message += ' (' + this._infoStr + ')';
      }
    }
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
  if(!this._code){
    this._code = [Cannot.codify(this._action), Cannot.codify(this._subject)];
    if(Cannot._config.prefix){
      this._code.unshift(Cannot.codify(Cannot._config.prefix));
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
    this._object = (this._info && this._info.at) || Cannot._config.object;
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
 * Return a string representation of this Cannot
 *
 * @api public
 */
Cannot.prototype.toString = function(){
  return this.message;
}
