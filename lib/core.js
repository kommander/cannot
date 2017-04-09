'use strict';
/*!
 * Broken (Cannot)
 * Simple error handling,
 * aiding in creating consistently human readable messages
 * without compromising machine processing ability.
 * _Cannot_ extends the base _Error_, can be thrown and behaves just like expected.
 * With a sweet syntax.
 *
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

function hiddens() {
  return {
    writable: true,
    enumerable: false,
    configurable: false,
  };
}

// Instance counter
let _count = 0;
const _config = {
  prefix: 'cannot',
  subject: 'I',
};

/**
 * Create a Broken error instance.
 * May be used as a method or instantiated with the `new` keyword.
 *
 * @param {String} verb
 * @param {String} object
 * @param {String|Broken|Object|...} reason
 * @return {Broken}
 * @api public
 */
function Broken(verb, object, reason) {
  if (!(this instanceof Broken)) {
    return new Broken(verb, object, reason);
  }

  Error.call(this);
  Error.captureStackTrace(this, Broken);

  ['_subject',
    '_verb',
    '_object',
    '_reason',
    '_message',
    '_data',
    '_infoStr',
  ].forEach((key) => Object.defineProperty(this, key, hiddens()));

  this._verb = verb;
  this._object = object;

  Object.defineProperty(this, 'id', withValue(++_count, false));
  Object.defineProperty(this, 'createdAt', withValue(Date.now(), false));

  // Set reason with the setter, so it is checked to be a Broken instance
  this.reason = reason;

  // Enforce full arguments to be consistent
  if (!this._verb || !this._object) {
    // eslint-disable-next-line
    throw Broken('create', 'error', 'verb or object is missing');
  }

  // Execute creation hooks
  Broken.executeHook('create', [this]);
}

// Extend error
Broken.prototype = Object.create(Error.prototype);

Broken.prototype.name = 'Error';
Broken.prototype.handled = false;

module.exports = Broken;

// Instance counter
Broken._count = 0;

// Global Broken Error handling settings
Broken.config = (config) => {
  for (const key in config) {
    /* istanbul ignore next */
    if ({}.hasOwnProperty.call(config, key)) {
      _config[key] = config[key];
    }
  }
};

Broken.prototype.__defineGetter__('isError', () => true);

/**
 * Reduce a string to a codified one by replacing whitespace and special chars to underscores
 *
 * @param {String} str
 * @return {String}
 * @api public
 */
Broken.codify = codify;

/**
 * A human readable message from the Broken data
 *
 * Example:
 * Broken('load', 'User').because('the connection was lost').message
 * // -> I could not load User, because the connection was lost.
 *
 * @return {Sring}
 * @api public
 */
Broken.prototype.__defineGetter__('message', function message() {
  return this._generateMessage();
});

/**
 * Attempt to generate a meaningful error message
 *
 * @api private
 */
Broken.prototype._generateMessage = function _generateMessage() {
  if (this._message) {
    return this._message;
  }

  const subject = this.subject;
  const verb = this._verb;
  const object_ = this._object;
  const reason = this._reason;

  // TODO: Move to extensions
  const info = this._infoStr;

  let build = [subject, ' could not ', verb, ' ', object_];
  if (reason) {
    if (reason instanceof Broken) {
      build = build.concat(', because ', reason.message);
    } else {
      // TODO: Move to reason getter or setter
      const text = reason.code || reason.message || reason.toString();
      build = build.concat(', because ', text, '.');
    }
    if (info) {
      build = build.concat(' (', info, ')');
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
 * Broken('load', 'User').because('connection was lost').verb // -> load
 *
 * @return {String}
 * @api public
 */
Broken.prototype.__defineGetter__('verb', function verb() {
  return codify(this._verb);
});

/**
 * Get the code property value
 *
 * Example:
 * Broken('load', 'User').because('connection was lost').code // -> load_user
 *
 * @return {String}
 * @api public
 */
Broken.prototype.__defineGetter__('code', function code() {
  if (!this._code) {
    this._code = [codify(this._verb), codify(this._object)];
    if (typeof _config.prefix === 'string'
    && _config.prefix.length > 0) {
      this._code.unshift(codify(_config.prefix));
    }
    this._code = this._code.join('_');
  }
  return this._code;
});

/**
 * Get the object property value
 *
 * Example:
 * Broken('load', 'User').because('connection was lost').object // -> user
 *
 * @return {String}
 * @api public
 */
Broken.prototype.__defineGetter__('object', function objectGetter() {
  return codify(this._object);
});

/**
 * Get the formulated reason for the exception
 *
 * Example:
 * Broken('load', 'User').because('connection was lost').reason // -> connection_was_lost
 *
 * @return {String}
 * @api public
 */
Broken.prototype.__defineGetter__('reason', function reasonGetter() {
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
Broken.prototype.__defineSetter__('reason', function reasonSetter(reason) {
  if (!reason) {
    return;
  }

  if (this._reason) {
    throw Broken('overwrite', 'reason'); // eslint-disable-line
  }

  if (typeof reason !== 'string'
  && typeof reason.code !== 'string'
  && !(reason instanceof Error)) {
    throw Broken('set', 'reason').because('neither string nor error code'); // eslint-disable-line
  }

  this._reason = reason;
});

/**
 * Subject
 *
 * @return {String}
 * @api public
 */
Broken.prototype.__defineGetter__('subject', function subjectGetter() {
  if (!this._subject) {
    this._subject = _config.subject;
  }
  return this._subject;
});

/**
 * Subject
 *
 * @api public
 */
Broken.prototype.__defineSetter__('subject', function subjectSetter(subject) {
  // TODO: Make sure the subject can only be set once
  this._subject = subject;
});

/**
 * Set reason with 'because' method chaining
 *
 * Example:
 * var err = Broken('load', 'User').because('connection was lost');
 *
 * @return {Broken} for chaining
 * @api public
 */
Broken.prototype.because = function because(reason) {
  this.reason = reason;
  return this;
};

/**
 * Set additional info
 *
 * Example:
 * var err = Broken('load', 'User').info('additional stuff');
 *
 * @return {Broken} for chaining
 * @api public
 */
Broken.prototype.addInfo = function info(infoStr) {
  this._infoStr = infoStr;
  return this;
};

/**
 * Set additional data to be handed further with the exception object
 *
 * Example:
 * var err = Broken('load', 'User').data({ some: 'value' });
 *
 * @return {Object} Returns the set data
 * @api public
 */
Broken.prototype.addData = function addData(data) {
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
Broken.prototype.__defineGetter__('data', function dataGetter() {
  return this._data ? this._data : null;
});

/**
 * Return a string representation of this Broken
 *
 * @api public
 */
Broken.prototype.toString = function toString() {
  return [this.name, ': ', this.message].join('');
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
    extension.call(this, Broken);
    return true;
  }
  return false;
}
Object.defineProperty(Broken, 'use', withValue(use));

/**
 *
 */
function extendObject(obj, propName, value, options) {
  const opts = options || { type: 'proto' };

  if (opts.type === 'proto') {
    if (obj.hasOwnProperty(propName)) {
      throw Broken('extend', 'prototype').because('the property already exists'); // eslint-disable-line
    }
    Object.defineProperty(obj, propName, withValue(value));
  }

  if (opts.type === 'get') {
    if (obj.hasOwnProperty(propName)) {
      throw Broken('extend', 'prototype with getter').because('the property already exists'); // eslint-disable-line
    }
    if (typeof value !== 'function') {
      throw Broken('extend', 'prototype with getter').because('value needs to be a function'); // eslint-disable-line
    }
    obj.__defineGetter__(propName, value);
  }
  return true;
}

function extend(propName, value, options) {
  extendObject(Broken.prototype, propName, value, options);
}
Object.defineProperty(Broken, 'extend', withValue(extend));

function extendInstance(propName, value, options) {
  extendObject(this, propName, value, options);
}
Object.defineProperty(Broken.prototype, 'extend', withValue(extendInstance));

/**
 *
 */
function curtail(propName) {
  if (Broken.prototype.hasOwnProperty(propName)) {
    delete Broken.prototype[propName];
    return true;
  }
  return false;
}
Object.defineProperty(Broken, 'curtail', withValue(curtail));

/**
 *
 */
const _hooks = {
  create: [],
};
function hook(name, fn) {
  if (!_hooks[name]) {
    throw Broken('hook into', name).because('a hook with that name does not exist'); // eslint-disable-line
  }
  if (_hooks[name].indexOf(fn) !== -1) {
    throw Broken('hook into', name).because('a hook for that function already exists'); // eslint-disable-line
  }
  _hooks[name].push(fn);
}
Object.defineProperty(Broken, 'hook', withValue(hook));

/**
 *
 */
function unhook(name, fn) {
  if (!_hooks[name]) {
    throw Broken('unhook', name).because('a hook with that name does not exist'); // eslint-disable-line
  }
  _hooks[name].splice(_hooks[name].indexOf(fn), 1);
}
Object.defineProperty(Broken, 'unhook', withValue(unhook));

/**
 *
 */
function executeHook(name, args) {
  for (let i = 0; i < _hooks[name].length; i++) {
    _hooks[name][i].apply(this, args);
  }
}
Object.defineProperty(Broken, 'executeHook', withValue(executeHook));

// Add default extensions
Broken.use(HandlingExtension);
Broken.use(HandlorExtension);
