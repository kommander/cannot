'use strict';

/* eslint-disable new-cap */
const expect = require('expect.js');
// const sinon = require('sinon');
const cannot = require('../');

describe('Extension API', () => {
  it('exposes the use() API', () => {
    expect(cannot).to.have.property('use');
    expect(cannot.use).to.be.a('function');
  });

  it('exposes the extend() API', () => {
    expect(cannot).to.have.property('extend');
    expect(cannot.extend).to.be.a('function');
  });

  it('exposes the hook() API', () => {
    expect(cannot).to.have.property('hook');
    expect(cannot.hook).to.be.a('function');
  });

  it('exposes extend/hook only through use()');

  describe('use()', () => {
    it('calls the extension method with Cannot', (done) => {
      const ext = (Cannot) => {
        expect(Cannot).to.be.a('function');
        expect(cannot).to.have.property('use');
        expect(cannot).to.have.property('extend');
        expect(cannot).to.have.property('hook');
        done();
      };
      cannot.use(ext);
    });

    it('does not add an extension again', () => {
      let counter = 0;
      const ext = () => {
        counter++;
      };
      const first = cannot.use(ext);
      const second = cannot.use(ext);
      expect(first).to.be.ok();
      expect(second).to.not.be.ok();
      expect(counter).to.be(1);
    });
  });

  describe('extend()', () => {
    it('does not overwrite existing prototypes', (done) => {
      expect(() => {
        cannot.extend('reason', () => false);
      }).to.throwException((ex) => {
        expect(ex).to.have.property('isError', true);
        done();
      });
    });

    it('allows to add a getter', () => {
      cannot.extend('newGetter', () => true, {
        type: 'get',
      });
      const err = cannot('do', 'somethin');
      expect(() => {
        err.newGetter = false;
      }).to.throwException();
      expect(err.newGetter).to.be.ok();
    });

    it('does not add a getter multiple times', () => {
      const getter = () => true;
      const opts = {
        type: 'get',
      };
      cannot.extend('newGetter2', getter, opts);
      expect(() => {
        cannot.extend('newGetter2', getter, opts);
      }).to.throwException();
    });

    it('allows to remove a getter again', () => {
      const getter = () => true;
      const opts = {
        type: 'get',
      };
      cannot.extend('newGetter3', getter, opts);
      cannot.curtail('newGetter3');
      expect(() => {
        cannot.extend('newGetter3', getter, opts);
      }).to.not.throwException();
    });

    it('does nothin when curtailing a non existing getter', () => {
      const result = cannot.curtail('unknown_getter');
      expect(result).to.not.be.ok();
    });


    it('does not add a non-function getter', () => {
      const getter = 'non-function';
      const opts = {
        type: 'get',
      };
      expect(() => {
        cannot.extend('some_unique_getter234234234', getter, opts);
      }).to.throwException();
    });

    it('allows to extend the current instance', (done) => {
      const hook = (instance) => {
        cannot.unhook('create', hook);
        const ext = () => true;
        instance.extend('someNewInstanceProp', ext);
        expect(instance).to.have.property('someNewInstanceProp', ext);
        done();
      };
      cannot.hook('create', hook);
      cannot('do', 'stuff');
    });
  });

  describe('hook()', () => {
    it('allows to remove a hook again', (done) => {
      const hook = () => {
        done('we should not get here');
      };
      cannot.hook('create', hook);
      cannot.unhook('create', hook);
      cannot('do', 'something');
      done();
    });

    it('allows to tap into instance creation', (done) => {
      const hook = (instance) => {
        expect(instance instanceof cannot).to.be.ok();
        done();
      };
      cannot.hook('create', hook);
      cannot('do', 'something');
      cannot.unhook('create', hook);
    });

    it('throws for non-existing hook name', () => {
      const hook = () => true;
      expect(() => {
        cannot.hook('notAtAllAHook', hook);
      }).to.throwException();
    });

    it('throws for existing hooks', () => {
      const hook = () => true;
      cannot.hook('create', hook);
      expect(() => {
        cannot.hook('create', hook);
      }).to.throwException();
    });

    it('throws for non-existing unhook name', () => {
      const hook = () => true;
      expect(() => {
        cannot.unhook('notAtAllAHook', hook);
      }).to.throwException();
    });
  });
});
