/*!
 * Cannot.js
 * Easy and fun error handling, by enforcing human readable messages
 * without compromising machine processing ability.
 * Copyright(c) Sebastian Herrlinger (https://github.com/kommander)
 * MIT Licensed
 */

/**
 * Create a Cannot error instance.
 * May be used as a method or instantiated with the `new` keyword.
 *
 * @param {String} verb
 * @param {String} object
 * @param {String|Cannot|Object|...} reason
 * @return {Cannot}
 * @api public
 */
function Cannot(verb, object, reason) {
  if (!(this instanceof Cannot)) {
    return new Cannot(verb, object, reason);
  }

  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  // Set a creation timestamp
  this.createdAt = Date.now();

  this._verb = verb;
  this._object = object;
  // Set reason with the setter, so it is checked to be a Cannot instance
  this.reason = reason;

  // Enforce full arguments to be consistent
  if (!this._verb || !this._object) {
    // eslint-disable-next-line
    throw Cannot('create', 'error', 'verb or object is missing');
  }

  this.id = ++Cannot._count;
}

// Extend error
Cannot.prototype = Object.create(Error.prototype);

Cannot.prototype.name = 'Error';
Cannot.prototype.handled = false;

module.exports = Cannot;

// Instance counter
Cannot._count = 0;

// Global Cannot Error handling settings
Cannot.config = (config) => {
  for (const key in config) {
    if ({}.hasOwnProperty.call(config, key)) {
      Cannot._config[key] = config[key];
    }
  }
};

// Default settings
Cannot._config = {
  prefix: 'cannot',
  subject: 'I',
};

/**
 * Reduce a string to a codified one by replacing whitespace and special chars to underscores
 *
 * @param {String} str
 * @return {String}
 * @api public
 */
Cannot.codify = (str) => str.replace(/[^A-Za-z0-9]{1,100}/igm, '_').toLowerCase();

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
Cannot.prototype.__defineGetter__('message', function message() {
  return this._generateMessage();
});

/**
 * Attempt to generate a meaningful error message
 * TODO: Improve string concatenation with array join
 *
 * @api private
 */
Cannot.prototype._generateMessage = function _generateMessage() {
  this._message = [this.subject, ' could not ', this._verb, ' ', this._object].join('');

  if (this._reason) {
    if (this._infoStr) {
      this._message += [' (', this._infoStr, ')'].join('');
    }
    if (this._reason instanceof Cannot) {
      this._message += [', because ', this._reason].join('');
    } else {
      const text = this._reason.code || this._reason.message || this._reason.toString();
      this._message += [', because ', text, '.'].join('');
    }
  } else {
    this._message += '. (No reason)';
    if (this._infoStr) {
      this._message += [' (', this._infoStr, ')'].join('');
    }
  }
  return this._message;
};

/**
 * Get the verb property
 *
 * Example:
 * Cannot('load', 'User').because('connection was lost').verb // -> load
 *
 * @return {String}
 * @api public
 */
Cannot.prototype.__defineGetter__('verb', function verb() {
  return Cannot.codify(this._verb);
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
Cannot.prototype.__defineGetter__('code', function code() {
  if (!this._code) {
    this._code = [Cannot.codify(this._verb), Cannot.codify(this._object)];
    if (typeof Cannot._config.prefix === 'string'
    && Cannot._config.prefix.length > 0) {
      this._code.unshift(Cannot.codify(Cannot._config.prefix));
    }
    this._code = this._code.join('_');
  }
  return this._code;
});

/**
 * Get the object property value and consider the Cannot handled
 *
 * Example:
 * Cannot('load', 'User').because('connection was lost').object // -> user
 *
 * @return {String}
 * @api public
 */
Cannot.prototype.__defineGetter__('object', function objectGetter() {
  return Cannot.codify(this._object);
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
Cannot.prototype.__defineGetter__('reason', function reasonGetter() {
  if (typeof this._reason === 'string') {
    return Cannot.codify(this._reason);
  }
  return this._reason.code ? this._reason.code : this._reason;
});

/**
 * Set the reason, but only if it was not set already to prevent it being overwritten.
 *
 * @api public
 */
Cannot.prototype.__defineSetter__('reason', function reasonSetter(reason) {
  if (!reason) {
    return;
  }

  if (this._reason) {
    throw Cannot('overwrite', 'Reason'); // eslint-disable-line
  }

  this._reason = reason;
});

/**
 * Subject
 *
 * @return {String}
 * @api public
 */
Cannot.prototype.__defineGetter__('subject', function subjectGetter() {
  if (!this._subject) {
    this._subject = (this._info && this._info.at) || Cannot._config.subject;
  }
  return this._subject;
});

/**
 * Subject
 *
 * @api public
 */
Cannot.prototype.__defineSetter__('subject', function subjectSetter(subject) {
  this._subject = subject;
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
Cannot.prototype.because = function because(reason) {
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
Cannot.prototype.info = function info(infoStr) {
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
Cannot.prototype.addData = function addData(data) {
  if (data) {
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
Cannot.prototype.__defineGetter__('data', function dataGetter() {
  return this._data ? this._data : null;
});

/**
 * Return a string representation of this Cannot
 *
 * @api public
 */
Cannot.prototype.toString = function toString() {
  return this.message;
};
