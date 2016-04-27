'use strict';
/*!
 * Cannot.js
 * Easy and fun error handling, by enforcing human readable messages
 * without compromising machine processing ability.
 * Copyright(c) Sebastian Herrlinger (https://github.com/kommander)
 * MIT Licensed
 */

// Default extensions (for now), added at the bottom
const HandlingExtension = require('./extensions/handling.js');
const HandlorExtension = require('./extensions/handlor.js');

function codify(str) {
  return str ? str.replace(/[^A-Za-z0-9]{1,100}/igm, '_').toLowerCase() : '';
}

function withValue(val, writeable) {
  return {
    writable: !!!(writeable),
    enumerable: false,
    configurable: false,
    value: val,
  };
}

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
  Error.captureStackTrace(this, Cannot);

  Object.defineProperty(this, '_verb', withValue(verb));
  Object.defineProperty(this, '_object', withValue(object));
  Object.defineProperty(this, '_reason', withValue());

  Object.defineProperty(this, '_data', withValue());
  Object.defineProperty(this, '_infoStr', withValue());

  Object.defineProperty(this, 'id', withValue(++Cannot._count, false));
  Object.defineProperty(this, 'createdAt', withValue(Date.now(), false));

  // Set reason with the setter, so it is checked to be a Cannot instance
  this.reason = reason;

  // Enforce full arguments to be consistent
  if (!this._verb || !this._object) {
    // eslint-disable-next-line
    throw Cannot('create', 'error', 'verb or object is missing');
  }

  // Execute creation hooks
  Cannot.executeHook('create', [this]);
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
    /* istanbul ignore next */
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

Cannot.prototype.__defineGetter__('isError', () => true);

/**
 * Reduce a string to a codified one by replacing whitespace and special chars to underscores
 *
 * @param {String} str
 * @return {String}
 * @api public
 */
Cannot.codify = codify;

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
 *
 * @api private
 */
Cannot.prototype._generateMessage = function _generateMessage() {
  const subject = this.subject;
  const verb = this._verb;
  const object = this._object;
  const reason = this._reason;

  // TODO: Move to extensions
  const info = this._infoStr;

  let build = [subject, ' could not ', verb, ' ', object];
  if (reason) {
    if (info) {
      build = build.concat(' (', info, ')');
    }
    if (reason instanceof Cannot) {
      build = build.concat(', because ', reason);
    } else {
      // TODO: Move to reason getter or setter
      const text = reason.code || reason.message || reason.toString();
      build = build.concat(', because ', text, '.');
    }
  } else {
    build = build.concat('. (No reason)');
    if (info) {
      build = build.concat(' (', info, ')');
    }
  }
  this._message = build.join('');
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
  return codify(this._verb);
});

/**
 * Get the code property value
 *
 * Example:
 * Cannot('load', 'User').because('connection was lost').code // -> load_user
 *
 * @return {String}
 * @api public
 */
Cannot.prototype.__defineGetter__('code', function code() {
  if (!this._code) {
    this._code = [codify(this._verb), codify(this._object)];
    if (typeof Cannot._config.prefix === 'string'
    && Cannot._config.prefix.length > 0) {
      this._code.unshift(codify(Cannot._config.prefix));
    }
    this._code = this._code.join('_');
  }
  return this._code;
});

/**
 * Get the object property value
 *
 * Example:
 * Cannot('load', 'User').because('connection was lost').object // -> user
 *
 * @return {String}
 * @api public
 */
Cannot.prototype.__defineGetter__('object', function objectGetter() {
  return codify(this._object);
});

/**
 * Get the formulated reason for the exception
 *
 * Example:
 * Cannot('load', 'User').because('connection was lost').reason // -> connection_was_lost
 *
 * @return {String}
 * @api public
 */
Cannot.prototype.__defineGetter__('reason', function reasonGetter() {
  if (this._reason && this._reason.code) {
    return this._reason.code;
  }
  if (this._reason instanceof Error) {
    return codify(this._reason.toString());
  }
  return codify(this._reason);
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
    throw Cannot('overwrite', 'reason'); // eslint-disable-line
  }

  if (typeof reason !== 'string'
  && typeof reason.code !== 'string'
  && !(reason instanceof Error)) {
    throw Cannot('set', 'reason').because('neither string nor error code'); // eslint-disable-line
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
    this._subject = Cannot._config.subject;
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
    // TODO: Extend existing data and throw if a property is overwritten
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

//
// EXTENSION API
//

/**
 *
 */
const _extensions = [];
function use(extension) {
  if (_extensions.indexOf(extension) === -1) {
    _extensions.push(extension);
    extension.call(this, Cannot);
    return true;
  }
  return false;
}
Object.defineProperty(Cannot, 'use', withValue(use));

/**
 *
 */
function extendObject(obj, propName, value, options) {
  const opts = options || { type: 'proto' };

  if (opts.type === 'proto') {
    if (obj.hasOwnProperty(propName)) {
      throw Cannot('extend', 'prototype').because('the property already exists'); // eslint-disable-line
    }
    Object.defineProperty(obj, propName, withValue(value));
  }

  if (opts.type === 'get') {
    if (obj.hasOwnProperty(propName)) {
      throw Cannot('extend', 'prototype with getter').because('the property already exists'); // eslint-disable-line
    }
    if (typeof value !== 'function') {
      throw Cannot('extend', 'prototype with getter').because('value needs to be a function'); // eslint-disable-line
    }
    obj.__defineGetter__(propName, value);
  }
  return true;
}

function extend(propName, value, options) {
  extendObject(Cannot.prototype, propName, value, options);
}
Object.defineProperty(Cannot, 'extend', withValue(extend));

function extendInstance(propName, value, options) {
  extendObject(this, propName, value, options);
}
Object.defineProperty(Cannot.prototype, 'extend', withValue(extendInstance));

/**
 *
 */
function curtail(propName) {
  if (Cannot.prototype.hasOwnProperty(propName)) {
    delete Cannot.prototype[propName];
    return true;
  }
  return false;
}
Object.defineProperty(Cannot, 'curtail', withValue(curtail));

/**
 *
 */
const _hooks = {
  create: [],
};
function hook(name, fn) {
  if (!_hooks[name]) {
    throw Cannot('hook into', name).because('a hook with that name does not exist'); // eslint-disable-line
  }
  if (_hooks[name].indexOf(fn) !== -1) {
    throw Cannot('hook into', name).because('a hook for that function already exists'); // eslint-disable-line
  }
  _hooks[name].push(fn);
}
Object.defineProperty(Cannot, 'hook', withValue(hook));

/**
 *
 */
function unhook(name, fn) {
  if (!_hooks[name]) {
    throw Cannot('unhook', name).because('a hook with that name does not exist'); // eslint-disable-line
  }
  _hooks[name].splice(_hooks[name].indexOf(fn), 1);
}
Object.defineProperty(Cannot, 'unhook', withValue(unhook));

/**
 *
 */
function executeHook(name, args) {
  for (let i = 0; i < _hooks[name].length; i++) {
    _hooks[name][i].apply(this, args);
  }
}
Object.defineProperty(Cannot, 'executeHook', withValue(executeHook));

// Add default extensions
Cannot.use(HandlingExtension);
Cannot.use(HandlorExtension);
