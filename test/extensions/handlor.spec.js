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

  it('throws when we try to register a non-function/empty handlor', (done) => {
    const err = cannot('load', 'user').because(cannot('do more', 'stuff'));

    expect(() => {
      err.handle('load', 'user', null);
    }).to.throwException();
    done();
  });

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
