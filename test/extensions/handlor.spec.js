/* eslint-disable new-cap */
const expect = require('expect.js');
// const sinon = require('sinon');
const cannot = require('../../lib/cannot.js');

describe('Handlor Extension', () => {
  it('provides a convenience method to handle an error (one handler)', (done) => {
    const err = cannot('load', 'user').because('stuff');

    // if a handle matches the err/reason and returns true,
    // the error is marked as handled,
    // so subsequent handles are not checked or called anymore
    err.handle('load', 'user', (reason) => {
      expect(reason).to.be('stuff');
      done();
    });
  });

  it('provides the handlor interface swell', (done) => {
    const err = cannot('load', 'user').because('stuff');

    err.handlor('load', 'user', 'stuff', (reason) => {
      expect(reason).to.be('stuff');
      done();
    });
  });

  it('handles an error (one handler, reason)', (done) => {
    const err = cannot('load', 'user').because('stuff');

    err.handle('load', 'user', 'stuff', (reason) => {
      expect(reason).to.be('stuff');
      done();
    });
  });

  it('handles an error (one handler, reason, multiword)', (done) => {
    const err = cannot('load', 'user').because('more stuff');

    err.handle('load', 'user', 'more stuff', () => {
      done();
    });
  });

  it('handles an error (one handler, reason, stacked error)', (done) => {
    const err = cannot('load', 'user').because(cannot('do more', 'stuff'));

    err.handle('load', 'user', 'cannot do more stuff', () => {
      done();
    });
  });

  it('provides reason as first, full error instance as second argument', (done) => {
    const err = cannot('load', 'user').because(cannot('do more', 'stuff'));

    err.handle('load', 'user', (reason, err) => {
      expect(reason).to.be('cannot_do_more_stuff');
      expect(err).to.have.property('isError', true);
      expect(err).to.have.property('code', 'cannot_load_user');
      done();
    });
  });

  it('handles an error (one handler, reason, obj)', (done) => {
    const err = cannot('load', 'user').because(cannot('do more', 'stuff'));

    err.handle('load', 'user', { none: 'string' }, () => {
      done('we should not get here');
    });
    done();
  });

  it('handles an error (one handler, obj, obj)', (done) => {
    const err = cannot('load', 'user').because(cannot('do more', 'stuff'));

    err.handle('load', { none: 'string' }, () => {
      done('we should not get here');
    });
    done();
  });

  // DEACTIVATED FOR THE .with() INTERFACE
  // it('throws when we try to register a non-function/empty handlor', (done) => {
  //   const err = cannot('load', 'user').because(cannot('do more', 'stuff'));
  //
  //   expect(() => {
  //     err.handle('load', 'user', null);
  //   }).to.throwException();
  //   done();
  // });

  describe('with interface', () => {
    it('hands down the reason first, second the error', (done) => {
      const err = cannot('load', 'user').because('handlor wants to handle');

      err.handle('load', 'user')
        .with((reason, error) => {
          expect(reason).to.be('handlor_wants_to_handle');
          expect(error.reason).to.be('handlor_wants_to_handle');
          done();
        });
    });

    it('calls in error context', (done) => {
      const err = cannot('load', 'user').because('handlor wants to handle');

      err.handle('load', 'user')
        .with(function handler() {
          expect(this).to.have.property('isError', true);
          expect(this).to.have.property('code', 'cannot_load_user');
          done();
        });
    });

    it('convenience methods to handle an error can be stacked', (done) => {
      const err = cannot('load', 'user');

      err.handle('load', 'user')
        .with(() => false)
        .with(() => false)
        .with(() => true)
        .with(() => false)
        .with(() => true)
        .with(() => done('not called anymore'));

      done();
    });
  });
});
