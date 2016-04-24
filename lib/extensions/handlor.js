//
// HANDLE / ASSERT
//
/* eslint-disable prefer-rest-params */
module.exports = function HandlorExtension(Cannot) {
  function assertIs(err, verb, object) {
    if (typeof object === 'string'
    && Cannot.codify(verb) === err.verb
    && Cannot.codify(object) === err.object) {
      return true;
    }
    return false;
  }

  function assertBecause(errReason, checkReason) {
    return typeof checkReason === 'string' && errReason === Cannot.codify(checkReason);
  }

  function handlor(verb, object) {
    const reason = arguments.length > 3 ? arguments[2] : null;
    const fn = arguments.length > 3 ? arguments[3] : arguments[2];

    if (!fn) {
      throw Cannot('register', 'handlor').because('no callback given'); // eslint-disable-line
    }

    const isCannot = assertIs(this, verb, object);
    const isReason = reason ? assertBecause(this.reason, reason) : true;

    if (isCannot && isReason) {
      fn.call(this, this.reason);
    }
  }

  Cannot.extend('handle', handlor);
  Cannot.extend('handlor', handlor);
};
