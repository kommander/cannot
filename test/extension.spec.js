'use strict';

/* eslint-disable new-cap */
const expect = require('expect.js');
// const sinon = require('sinon');
const cannot = require('../lib/cannot.js');

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
        console.log(instance.code);
        expect(instance instanceof cannot).to.be.ok();
        done();
      };
      cannot.hook('create', hook);
      cannot('do', 'something');
      cannot.unhook('create', hook);
    });
  });
});
