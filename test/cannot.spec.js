/**
 * Tests for: lib/core/core.js
 */
/* eslint-disable new-cap */
const expect = require('expect.js');
// const sinon = require('sinon');
const Cannot = require('../lib/cannot.js');

describe('Cannot Exception', () => {
  //
  //
  it('Should create an exception from arguments', () => {
    const err = new Cannot(
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
  it('Should allow construction without the "new" keyword', () => {
    const err = Cannot(
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
    const err = Cannot(
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
  it('Should work with promises', (done) => {
    const promiseFn = () => new Promise((resolve, reject) => {
      reject(Cannot('do', 'something'));
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
      Cannot(null, 'user');
    }).to.throwException();
  });

  //
  //
  it('should throw an Error if no object is given', () => {
    expect(() => {
      Cannot('load', null);
    }).to.throwException();
  });

  //
  //
  it('should be configurable', () => {
    Cannot.config({
      prefix: 'could not',
    });
    const err = Cannot('do', 'something');
    expect(err).to.have.property('code', 'could_not_do_something');

    // Reset to default
    Cannot.config({ prefix: 'cannot' });
  });

  //
  //
  it('should work without prefix', () => {
    Cannot.config({
      prefix: '',
    });
    const err = Cannot('do', 'something');
    expect(err).to.have.property('code', 'do_something');

    // Reset to default
    Cannot.config({ prefix: 'cannot' });
  });

  it('should handle non-string reasons', () => {
    const err = Cannot('do', 'something');
    err.reason = { code: 'something_else' };
    expect(err.reason).to.be('something_else');
  });

  it('should handle non-string reasons without _code_ attribute', () => {
    const err = Cannot('do', 'something');
    err.reason = { none: 'something_else' };
    expect(err.reason).to.be.an('object');
    expect(err.reason).to.have.property('none', 'something_else');
  });

  it('should be possible to set the subject', () => {
    const err = Cannot('fly', 'away');
    err.subject = 'Alice';
    expect(err.subject).to.be('Alice');
    expect(err.message).to.be('Alice could not fly away. (No reason)');
  });

  //
  //
  it('should have an verb attribute', () => {
    const err = Cannot('load', 'user');
    expect(err.verb).to.be('load');
  });

  //
  //
  describe('#message', () => {
    //
    //
    it('Should return a formulated error message', () => {
      const err = Cannot(
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
      const err = Cannot(
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
      const err = Cannot(
        'load',
        'something',
        Cannot(
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
      const err = Cannot(
        'load',
        'something'
      ).because(
        Cannot(
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
      const err = Cannot('fly into', 'the sky').because('she is out of mushrooms');

      expect(err).to.have.property('reason', 'she_is_out_of_mushrooms');
    });


    //
    // TODO: Allow adding multiple reasons 'because X and Y and Z'
    it('should throw an error when setting the reason twice', () => {
      const err = Cannot('fly into', 'the sky').because('she is out of mushrooms');

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
      const err = Cannot('fly into', 'the sky').addData({
        key: 'value',
      });

      expect(err).to.have.property('data');
      expect(err.data).to.be.an('object');
      expect(err.data).to.have.property('key', 'value');
    });

    //
    //
    it('data should return null if none was given', () => {
      const err = Cannot('fly into', 'the sky');

      expect(err).to.have.property('data');
      expect(err.data).to.be(null);
    });

    //
    //
    it('does not overwrite with empty data', () => {
      const err = Cannot('fly into', 'the sky').addData({
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
      const err = Cannot('fly into', 'the sky').info('additional stuff');

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
      const err1 = Cannot('overcome', 'gravity');
      const err = Cannot('fly into', 'the sky').info('additional stuff').because(err1);

      expect(err).to.have.property('_infoStr');
      expect(err._infoStr).to.be.a('string');
      expect(err._infoStr).to.be('additional stuff');
      // eslint-disable-next-line
      expect(err.message).to.be('I could not fly into the sky (additional stuff), because I could not overcome gravity. (No reason)');
    });
  });
});
