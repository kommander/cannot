//
// HANDLE / ASSERT
//
/* eslint-disable prefer-rest-params */
module.exports = function HandlingExtension(Cannot) {
  function withValue(val, writeable) {
    return {
      writable: !!!(writeable),
      enumerable: false,
      configurable: false,
      value: val,
    };
  }

  function assertIs(err, verb, object) {
    if (typeof object === 'string'
    && Cannot.codify(verb) === err.verb
    && Cannot.codify(object) === err.object) {
      return true;
    }
    if (Cannot.codify(verb) === err.code) {
      return true;
    }
    return false;
  }

  Cannot.extend('_setupIs', function _setupIs() {
    const is = (verb, object) => assertIs(this, verb, object);
    this.extend('is', is);
    const cannotFn = this.assertCannot.bind(this);
    Object.defineProperty(this.is, 'cannot', withValue(cannotFn, false));
  });

  Cannot.extend('assertBecause', function assertBecause(isCannot, reason) {
    return isCannot ? this.reason === Cannot.codify(reason) : false;
  });


  /**
   * BecauseInterface
   */
  function BecauseInterface(isCannot, ctx) {
    Object.defineProperty(this, 'because', withValue(ctx.assertBecause.bind(ctx, isCannot)));
    const cannotFn = isCannot && ctx._reason && ctx._reason.isError
      ? ctx._reason.is.bind(ctx._reason) : () => false;
    Object.defineProperty(this.because, 'cannot', withValue(cannotFn));
    Object.defineProperty(this, 'value', withValue(isCannot));
  }

  BecauseInterface.prototype = Object.create(Boolean);

  BecauseInterface.prototype.valueOf = function valueOf() {
    return this.value;
  };

  BecauseInterface.prototype.true = function trueFn() {
    return this.value;
  };

  BecauseInterface.prototype.false = function falseFn() {
    return !this.value;
  };

  Cannot.extend('assertCannot', function assertCannot(verb, object) {
    const isCannot = assertIs(this, verb, object);
    return new BecauseInterface(isCannot, this);
  });

  /**
   *
   */
  Cannot.extend('assert', function assert() {
    return {
      cannot: (verb, object) => this.assertCannot(verb, object),
    };
  }, { type: 'get' });

  // Finally, tap into Cannot.hook
  Cannot.hook('create', (instance) => {
    instance._setupIs();
  });
};
