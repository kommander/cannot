/**
 * Tests for: lib/core/core.js
 */
/* eslint-disable new-cap */
const expect = require('expect.js');
// const sinon = require('sinon');
const cannot = require('../lib/cannot.js');

describe('Module', () => {
  //
  //
  it('exposes isError', () => {
    const err = new cannot(
      'load',
      'something'
    );

    expect(err).to.have.property('isError', true);
  });

  //
  //
  it('Should create an exception from arguments', () => {
    const err = new cannot(
      'load',
      'something',
      'there is nothing to load'
    );

    expect(err).to.be.an('object');
    expect(err).to.have.property('code', 'cannot_load_something');
    expect(err).to.have.property('object', 'something');
    expect(err).to.have.property('reason', 'there_is_nothing_to_load');
    expect(err instanceof Error).to.be.ok();
  });

  //
  //
  it('Should have a stack trace', (done) => {
    const err = new cannot(
      'load',
      'something',
      'there is nothing to load'
    );

    expect(() => { throw err; }).to.throwException((ex) => {
      expect(ex).to.have.property('stack');
      expect(ex.stack.split('\n').length).to.be(11);
      done();
    });
  });

  //
  //
  it('Should allow construction without the "new" keyword', () => {
    const err = cannot(
      'load',
      'something',
      'there is nothing to load'
    );

    expect(err).to.be.an('object');
    expect(err).to.have.property('code', 'cannot_load_something');
    expect(err).to.have.property('object', 'something');
    expect(err).to.have.property('reason', 'there_is_nothing_to_load');
    expect(err instanceof Error).to.be.ok();
  });

  //
  //
  it('Should work without a reason', () => {
    const err = cannot(
      'load',
      'something'
    );

    expect(err).to.be.an('object');
    expect(err).to.have.property('code', 'cannot_load_something');
    expect(err).to.have.property('object', 'something');
    const messageTest = err.message.match(/.*[\s]{1}could not load something\. \(No reason\)/ig);
    expect(messageTest).to.be.ok();
  });

  //
  //
  it('should get and set a string reason', () => {
    const err = new cannot(
      'load',
      'something'
    ).because('string reason');

    expect(err).to.have.property('reason', 'string_reason');
  });


  //
  //
  it('Should work with promises', (done) => {
    const promiseFn = () => new Promise((resolve, reject) => {
      reject(cannot('do', 'something'));
    });

    promiseFn().catch((err) => {
      try {
        expect(err).to.have.property('code', 'cannot_do_something');
      } catch (e) {
        done(e);
      }
      done();
    });
  });

  //
  //
  it('should throw an Error if no verb is given', () => {
    expect(() => {
      cannot(null, 'user');
    }).to.throwException();
  });

  //
  //
  it('should throw an Error if no object is given', () => {
    expect(() => {
      cannot('load', null);
    }).to.throwException();
  });

  //
  //
  it('should be configurable', () => {
    cannot.config({
      prefix: 'could not',
    });
    const err = cannot('do', 'something');
    expect(err).to.have.property('code', 'could_not_do_something');

    // Reset to default
    cannot.config({ prefix: 'cannot' });
  });

  //
  //
  it('should work without prefix', () => {
    cannot.config({
      prefix: '',
    });
    const err = cannot('do', 'something');
    expect(err).to.have.property('code', 'do_something');

    // Reset to default
    cannot.config({ prefix: 'cannot' });
  });

  it('should handle non-string reasons', () => {
    const err = cannot('do', 'something');
    err.reason = { code: 'something_else' };
    expect(err.reason).to.be('something_else');
  });

  it('should NOT handle non-string reasons without _code_ attribute (except Errors)', () => {
    const err = cannot('do', 'something');
    const cause = { none: 'something_else' };

    expect(() => {
      err.reason = cause;
    }).to.throwException();
  });

  it('should handle non-string reasons of type Error', () => {
    const err = cannot('do', 'something');
    const cause = new Error('What the heck');
    err.reason = cause;
    expect(err.reason).to.be('error_what_the_heck');
  });

  it('should be possible to set the subject', () => {
    const err = cannot('fly', 'away');
    err.subject = 'Alice';
    expect(err.subject).to.be('Alice');
    expect(err.message).to.be('Alice could not fly away. (No reason)');
  });

  //
  //
  it('should have an verb attribute', () => {
    const err = cannot('load', 'user');
    expect(err.verb).to.be('load');
  });

  //
  //
  describe('codify', () => {
    //
    //
    it('handles false input', () => {
      const result = cannot.codify(null);
      expect(result).to.be('');
    });
  });

  //
  //
  describe('#message', () => {
    //
    //
    it('Should return a formulated error message', () => {
      const err = cannot(
        'load',
        'something',
        'there is nothing to load'
      );

      expect(err).to.be.an('object');
      const messageTest = err.message.match(
        /.*[\s]{1}could not load something, because there is nothing to load\./ig
      );
      expect(messageTest).to.be.ok();
    });

    //
    //
    it('Should include reason into the message', () => {
      const err = cannot(
        'load',
        'something',
        {
          code: 'fakeParent',
          message: 'went wrong, omg!',
        }
      );

      expect(err).to.be.an('object');
      expect(err).to.have.property('code', 'cannot_load_something');
      expect(err).to.have.property('object', 'something');
      const messageTest = err.message.match(
        /.*[\s]{1}could not load something, because fakeParent\./ig
      );
      expect(messageTest).to.be.ok();
    });

    //
    //
    it('Should handle stacked exceptions', () => {
      const err = cannot(
        'load',
        'something',
        cannot(
          'connect',
          'to internet',
          {
            code: 'ground_zero',
            message: 'went wrong, omg!',
          }
        )
      );

      expect(err).to.be.an('object');
      expect(err).to.have.property('code', 'cannot_load_something');
      expect(err).to.have.property('object', 'something');
      // eslint-disable-next-line
      const messageTest = err.message.match(/.*[\s]{1}could not load something, because .*[\s]{1}could not connect to internet, because ground_zero\./ig);
      expect(messageTest).to.be.ok();
    });


    //
    //
    it('Should handle stacked exceptions (using because helper)', () => {
      const err = cannot(
        'load',
        'something'
      ).because(
        cannot(
          'connect',
          'to internet',
          {
            code: 'ground_zero',
            message: 'went wrong, omg!',
          }
        )
      );

      expect(err).to.be.an('object');
      expect(err).to.have.property('code', 'cannot_load_something');
      expect(err).to.have.property('object', 'something');
      // eslint-disable-next-line
      const messageTest = err.message.match(/.*[\s]{1}could not load something, because .*[\s]{1}could not connect to internet, because ground_zero\./ig);
      expect(messageTest).to.be.ok();
    });
  });


  //
  //
  describe('because chain', () => {
    //
    //
    it('should add a reason to the exception', () => {
      const err = cannot('fly into', 'the sky').because('she is out of mushrooms');

      expect(err).to.have.property('reason', 'she_is_out_of_mushrooms');
    });

    //
    // TODO: Allow adding multiple reasons 'because X and Y and Z'
    it('should throw an error when setting the reason twice', () => {
      const err = cannot('fly into', 'the sky').because('she is out of mushrooms');

      expect(() => {
        err.because('she has enough mushrooms');
      }).to.throwException((ex) => {
        expect(ex).to.have.property('code', 'cannot_overwrite_reason');
      });
    });
  });

  //
  //
  describe('data attributes', () => {
    //
    //
    it('should add data to the exception', () => {
      const err = cannot('fly into', 'the sky').addData({
        key: 'value',
      });

      expect(err).to.have.property('data');
      expect(err.data).to.be.an('object');
      expect(err.data).to.have.property('key', 'value');
    });

    //
    //
    it('data should return null if none was given', () => {
      const err = cannot('fly into', 'the sky');

      expect(err).to.have.property('data');
      expect(err.data).to.be(null);
    });

    //
    //
    it('does not overwrite with empty data', () => {
      const err = cannot('fly into', 'the sky').addData({
        key: 'value',
      }).addData(null);

      expect(err).to.have.property('data');
      expect(err.data).to.be.an('object');
      expect(err.data).to.have.property('key', 'value');
    });
  });

  //
  //
  describe('info attributes', () => {
    //
    //
    it('should add info to the message if given', () => {
      const err = cannot('fly into', 'the sky').info('additional stuff');

      expect(err).to.have.property('_infoStr');
      expect(err._infoStr).to.be.a('string');
      expect(err._infoStr).to.be('additional stuff');
      expect(err.message).to.be('I could not fly into the sky. (No reason) (additional stuff)');
    });
  });

  //
  //
  describe('stacked info attributes', () => {
    //
    //
    it('should add info to the message if given', () => {
      const err1 = cannot('overcome', 'gravity');
      const err = cannot('fly into', 'the sky').info('additional stuff').because(err1);

      expect(err).to.have.property('_infoStr');
      expect(err._infoStr).to.be.a('string');
      expect(err._infoStr).to.be('additional stuff');
      // eslint-disable-next-line
      expect(err.message).to.be('I could not fly into the sky (additional stuff), because I could not overcome gravity. (No reason)');
    });
  });

  //
  //
  describe('reason/error handling', () => {
    it('provides a convenience checker (verb/object)', () => {
      const err = cannot('load', 'user');

      expect(err.is('load', 'user')).to.be.ok();
      expect(err.is('save', 'user')).to.not.be.ok();
    });

    it('provides a convenience checker (multiword verb/object)', () => {
      const err = cannot('connect to', 'database');

      expect(err.is('connect to', 'database')).to.be.ok();
      expect(err.is('save', 'user')).to.not.be.ok();
    });

    it('provides a convenience checker (error code)', () => {
      const err = cannot('load', 'user');

      // with a single argument the convenience .is() checker
      // evaluates the error code instead of the verb/object
      expect(err.is('cannot load user')).to.be.ok();
      expect(err.is('cannot save user')).to.not.be.ok();
    });

    //
    it('provides a convenience checker (verb / object, assert.cannot, because)', () => {
      const err = cannot('load', 'user').because('database is down');

      expect(err.assert.cannot('load', 'user')).to.have.property('because');
    });

    it('provides a convenience checker (verb/object, is.cannot, because)', () => {
      const err = cannot('load', 'user');

      expect(err.is.cannot('load', 'user')).to.have.property('because');
    });

    it('assert is bound correctly to this.is', () => {
      const err = cannot('load', 'user');
      const err2 = cannot('save', 'user');

      expect(err.is.cannot('load', 'user')).to.be.ok();
      expect(err2.is.cannot('save', 'user')).to.be.ok();
    });

    it('allows to recover from a specific reason (error code, assert.cannot)', () => {
      const err = cannot('load', 'user').because('database is down');

      expect(err.assert.cannot('load', 'user').because('database is down')).to.be.ok();
      expect(err.assert.cannot('load', 'user').because('user not found')).to.not.be.ok();
    });

    it('recovers from a specific reason (error code, assert.cannot, other err object)', () => {
      const err = cannot('load', 'user').because({
        code: 'database_is_down',
      });

      expect(err.assert.cannot('load', 'user').because('database is down')).to.be.ok();
      expect(err.assert.cannot('load', 'user').because('user not found')).to.not.be.ok();
    });

    it('allows to recover from a specific reason (error code, is.cannot)', () => {
      const err = cannot('load', 'user').because('database is down');

      expect(err.is.cannot('load', 'user').because('database is down')).to.be.ok();
      expect(err.is.cannot('load', 'user').because('user not found')).to.not.be.ok();
    });

    it('allows to recover from a specific reason (error code, is.cannot, false cannot)', () => {
      const err = cannot('load', 'user').because('database is down');

      expect(err.is.cannot('save', 'user').because('database is down')).to.not.be.ok();
    });

    it('provides a convenience checker (verb/object, is.cannot)', () => {
      const err = cannot('load', 'user').because(cannot('connect to', 'database'));
      expect(err.is.cannot('load', 'user')).to.be.ok();
    });

    it('provides a convenience checker (verb/object, true())', () => {
      const err = cannot('load', 'user');
      expect(err.is.cannot('load', 'user').true()).to.be.ok();
    });

    it('provides a convenience checker (verb/object, false())', () => {
      const err = cannot('load', 'user');
      expect(err.is.cannot('save', 'user').false()).to.be.ok();
    });

    it('provides a convenience checker (verb/object, weak comparison)', () => {
      const err = cannot('load', 'user');
      expect(err.is.cannot('save', 'user') == false).to.be.ok(); // eslint-disable-line
    });

    it('provides a convenience checker (verb/object, if clause)', () => {
      const err = cannot('load', 'user');
      expect((() => {
        if (err.is.cannot('save', 'user').true()) {
          return false;
        }
        return true;
      })()).to.be.ok();
    });

    // Make it work
    //
    // it('provides a convenience checker (verb/object, weak comparison, if clause)', () => {
    //   const err = cannot('load', 'user');
    //   expect((() => {
    //     if (err.is.cannot('save', 'user')) {
    //       return false;
    //     }
    //     return true;
    //   })()).to.be.ok();
    // });

    it('provides a convenience checker (verb/object, weak comparison, reverse)', () => {
      const err = cannot('load', 'user');
      expect(err.is.cannot('save', 'user') == true).to.not.be.ok(); // eslint-disable-line
    });

    // Make it work
    //
    // it('provides a convenience checker (verb/object, hard comparison)', () => {
    //   const err = cannot('load', 'user');
    //   expect(err.is.cannot('save', 'user') === false).to.be.ok(); // eslint-disable-line
    // });

    it('provides a convenience checker (verb/object, hard comparison, !!)', () => {
      const err = cannot('load', 'user');
      expect(!!err.is.cannot('save', 'user')).to.be.ok(); // eslint-disable-line
    });

    it('provides a convenience checker (verb/object, hard comparison, !)', () => {
      const err = cannot('load', 'user');
      expect(!err.is.cannot('save', 'user')).to.not.be.ok(); // eslint-disable-line
    });

    it('provides a convenience checker (verb/object, false, revert)', () => {
      const err = cannot('load', 'user').because(cannot('connect to', 'database'));
      expect(err.is.cannot('save', 'user').false()).to.be.ok();
    });

    //
    it('allows to recover from a specific reason (verb/object, because.cannot)', () => {
      const err = cannot('load', 'user').because(cannot('connect to', 'database'));
      const check = err.is.cannot('load', 'user').because.cannot('connect to', 'database');
      expect(check).to.be.ok();
    });

    //
    it('allows to recover from a specific reason (verb/object, assert.cannot)', () => {
      const err = cannot('load', 'user').because(cannot('connect to', 'database'));
      const check = err.assert.cannot('load', 'user').because.cannot('connect to', 'database');
      expect(check).to.be.ok();
    });

    it('recovers from a specific reason (verb/object, because.cannot, false cannot)', () => {
      const err = cannot('load', 'user').because(cannot('connect to', 'database'));
      const check = err.is.cannot('save', 'user').because.cannot('connect to', 'database');
      expect(check).to.not.be.ok();
    });

    it('checks case insensitive', () => {
      const err = cannot('load', 'user').because('database is down');

      expect(err.is.cannot('lOaD', 'UsEr').because('DataBase is dOwn')).to.be.ok();
      expect(err.is.cannot('loAd', 'uSer').because('usEr not fOund')).to.not.be.ok();
    });

    // ERROR HANDLING INTERFACE SUGGESTIONS
    //
    // it('provides convenience methods to handle an error (one handler)', (done) => {
    //   const err = cannot('load', 'user');
    //
    //   // if a handle matches the err/reason and returns true,
    //   // the error is marked as handled,
    //   // so subsequent handles are not checked or called anymore
    //   err.handle('load', 'user', (reason) => {
    //     done();
    //     return true;
    //   });
    // });
    //
    // it('convenience methods to handle an error can be stacked', () => {
    //   const err = cannot('load', 'user');
    //
    //   err.handle('load', 'user')
    //     .with((reason) => {
    //       return false;
    //     })
    //     .with(() => {
    //       return true;
    //     })
    //     .with(() => {
    //       done('not called anymore')
    //     });
    // });
    //
    // it('provides handler interface for a specific reason', () => {
    //   const err = cannot('load', 'user')
    //     .because(cannot('connect to', 'database'));
    //
    //   err.handle.cannot('load', 'user')
    //     .because.cannot('connect to', 'database')
    //     .with(() => {
    //       return false;
    //     })
    //     .with(() => {
    //       return true;
    //     })
    //     .with(() => {
    //       done('not called anymore')
    //     });
    // });
  });
});
