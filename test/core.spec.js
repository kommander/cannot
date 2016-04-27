/**
 * Tests
 */
/* eslint-disable new-cap */
const expect = require('expect.js');
// const sinon = require('sinon');
const cannot = require('../');
const semver = require('semver');

//
// TODO: Make sure .message, .code and .reason is enumerable
//

describe('Core', () => {
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

    // Stack growth from v5.9.0 to v5.9.1
    if (semver.lt(process.version, '5.9.1')) {
      expect(() => { throw err; }).to.throwException((ex) => {
        expect(ex).to.have.property('stack');
        expect(ex.stack.split('\n').length).to.be(11);
        done();
      });
    } else {
      expect(() => { throw err; }).to.throwException((ex) => {
        expect(ex).to.have.property('stack');
        expect(ex.stack.split('\n').length).to.be(12);
        done();
      });
    }
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
    // May return "No reason." here as well
    expect(err).to.have.property('reason', '');
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
  it('behaves like a stringified Error', () => {
    const err = new cannot(
      'load',
      'something'
    ).because('string reason');

    expect(err.toString()).to.be('Error: I could not load something, because string reason.');
  });

  //
  //
  it('has hiddens', () => {
    const err = new cannot(
      'load',
      'something'
    ).because('string reason');

    const keys = Object.keys(err);
    expect(keys).to.have.property('length', 0);
  });

  //
  //
  it('returns correct valueOf');

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
  it("provides `return cannot.promise('to load', 'user').because({{ reason }});`");

  //
  //
  // Something like...?
  // .catch(cannot => cannot.promise('to load', 'user').then(handle => Promise.resolve()...)
  // .catch(cannot => cannot.promise('to load', 'user').because({{ reason }}).then(...)
  it("adding resolvers: .catch(cannot => cannot.promise('to load', 'user').then(...)");

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

  it('should handle null and undefined reasons', () => {
    const err = cannot('do', 'something').because(null);

    expect(err.reason).to.be('');
  });

  it('should be possible to set the subject', () => {
    const err = cannot('fly', 'away');
    err.subject = 'Alice';
    expect(err.subject).to.be('Alice');
    expect(err.message).to.be('Alice could not fly away. (No reason)');
  });

  //
  //
  it('should have a verb attribute', () => {
    const err = cannot('load', 'user');
    expect(err.verb).to.be('load');
  });

  //
  //
  describe('configuration', () => {
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
    it('exposes immutable config');

    //
    //
    it('keeps track of config changes');
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

    //
    //
    it('should always add " (No reason)." to the message if none was given"');

    //
    //
    // it('Dev Mode: should add " (No reason, {{ sarcasm }})." to the message if none was given"');
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
  describe('Serialize', () => {
    //
    //
    it('exposes and instance identifier (.id)');

    //
    //
    // A unique hash that identiefies the error with a source/location and info,
    // so it can be traced back nicely
    it('exposes a readable hash for comparison '
      + '(.token == hash("loaduser_databasefailed_addinfo_core_45")');

    it('should provide a json format wrapper');
    it('should provide a binary format wrapper');
  });

  //
  //
  describe('Security', () => {
    it('has to provide facilities to whitelist allowed output');
    it('should distinct between user/dev/admin levels ');
  });
});
