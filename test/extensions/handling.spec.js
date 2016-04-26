/* eslint-disable new-cap */
const expect = require('expect.js');
// const sinon = require('sinon');
const cannot = require('../../lib/cannot.js');

//
// TODO: Make assert really assert (throw if it fails)
//       -> .is will then only evaluate
//

describe('Handling/Assert Extension', () => {
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
  it('provides a convenience checker (verb/object, weak comparison, if clause)');
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
  it('provides a convenience checker (verb/object, hard comparison)');
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
