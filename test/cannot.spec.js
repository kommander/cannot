/**
 * Tests for: lib/core/core.js
 */

var expect = require('expect.js');
var sinon = require('sinon');
var events = require('events');
var EventEmitter = events.EventEmitter;

var Cannot = require('../lib/cannot.js');


describe('Cannot Exception', function(){

  //
  //
  it('Should create an exception from arguments', function(){
    var err = new Cannot(
      'load',
      'something',
      'there is nothing to load'
    );

    expect(err).to.be.an('object');
    expect(err).to.have.property('code', 'cannot_load_something');
    expect(err).to.have.property('subject', 'something');
    expect(err).to.have.property('reason', 'there_is_nothing_to_load');
    expect(err instanceof Error).to.be.ok();
  });

  //
  //
  it('Should allow construction without the "new" keyword', function(){
    var err = Cannot(
      'load',
      'something',
      'there is nothing to load'
    );

    expect(err).to.be.an('object');
    expect(err).to.have.property('code', 'cannot_load_something');
    expect(err).to.have.property('subject', 'something');
    expect(err).to.have.property('reason', 'there_is_nothing_to_load');
    expect(err instanceof Error).to.be.ok();
  });

  //
  //
  it('Should work without a reason', function(){
    var err = Cannot(
      'load',
      'something'
    );

    expect(err).to.be.an('object');
    expect(err).to.have.property('code', 'cannot_load_something');
    expect(err).to.have.property('subject', 'something');
    var messageTest = err.message.match(/.*[\s]{1}could not load something\. \(No reason\)/ig);
    expect(messageTest).to.be.ok();
  });

  //
  //
  it('Should work with promises', function(done){
    const promiseFn = () => {
      return new Promise((resolve, reject) => {
        reject(Cannot('do', 'something'));
      });
    };

    promiseFn().catch((err) => {
      try {
        expect(err).to.have.property('code', 'cannot_do_something');
      } catch(e){
        done(e);
      }
      done();
    });
  });

  //
  //
  it('should throw an Error if no subject or action is given', function(){
    expect(function(){
      Cannot(null, null);
    }).to.throwException();
  });

  //
  //
  it('should be configurable', function(){
    Cannot.config({
      prefix: 'could not'
    });
    var err = Cannot('do', 'something');
    expect(err).to.have.property('code', 'could_not_do_something');

    // Reset to default
    Cannot.config({ prefix: 'cannot' });

  });

  it('should handle non-string reasons', function(){
    var err = Cannot('do', 'something');
    err.reason = { code: 'something_else' };
    expect(err.reason).to.be('something_else');
  });

  it('should handle non-string reasons without _code_ attribute', function(){
    var err = Cannot('do', 'something');
    err.reason = { none: 'something_else' };
    expect(err.reason).to.be.an('object');
    expect(err.reason).to.have.property('none', 'something_else');
  });

  it('should be possible to set the object', function(){
    var err = Cannot('fly', 'away');
    err.object = 'Alice';
    expect(err.object).to.be('Alice');
    expect(err.message).to.be('Alice could not fly away. (No reason)');
  });

  //
  //
  it('should have an action attribute', function(){
    var err = Cannot('load', 'user');
    expect(err.action).to.be('load');
  });

  //
  //
  describe('#message', function(){
    //
    //
    it('Should return a formulated error message', function(){

      var err = Cannot(
        'load',
        'something',
        'there is nothing to load'
      );

      expect(err).to.be.an('object');
      var messageTest = err.message.match(/.*[\s]{1}could not load something, because there is nothing to load\./ig);
      expect(messageTest).to.be.ok();
    });

    //
    //
    it('Should include reason into the message', function(){

      var err = Cannot(
        'load',
        'something',
        {
          code: 'fakeParent',
          message: 'went wrong, omg!'
        }
      );

      expect(err).to.be.an('object');
      expect(err).to.have.property('code', 'cannot_load_something');
      expect(err).to.have.property('subject', 'something');
      var messageTest = err.message.match(/.*[\s]{1}could not load something, because fakeParent\./ig);
      expect(messageTest).to.be.ok();
    });

    //
    //
    it('Should handle stacked exceptions', function(){

      var err = Cannot(
        'load',
        'something',
        Cannot(
          'connect',
          'to internet',
          {
            code: 'ground_zero',
            message: 'went wrong, omg!'
          }
        )
      );

      expect(err).to.be.an('object');
      expect(err).to.have.property('code', 'cannot_load_something');
      expect(err).to.have.property('subject', 'something');
      var messageTest = err.message.match(/.*[\s]{1}could not load something, because .*[\s]{1}could not connect to internet, because ground_zero\./ig);
      expect(messageTest).to.be.ok();
    });


    //
    //
    it('Should handle stacked exceptions (using because helper)', function(){

      var err = Cannot(
        'load',
        'something'
      ).because(
        Cannot(
          'connect',
          'to internet',
          {
            code: 'ground_zero',
            message: 'went wrong, omg!'
          }
        )
      );

      expect(err).to.be.an('object');
      expect(err).to.have.property('code', 'cannot_load_something');
      expect(err).to.have.property('subject', 'something');
      var messageTest = err.message.match(/.*[\s]{1}could not load something, because .*[\s]{1}could not connect to internet, because ground_zero\./ig);
      expect(messageTest).to.be.ok();
    });


  });


  //
  //
  describe('because chain', function(){
    //
    //
    it('should add a reason to the exception', function(){

      var err = Cannot('fly into', 'the sky').because('she is out of mushrooms');

      expect(err).to.have.property('reason', 'she_is_out_of_mushrooms');

    });


    //
    // TODO: Allow adding multiple reasons 'because X and Y and Z'
    it('should throw an error when setting the reason twice', function(){

      var err = Cannot('fly into', 'the sky').because('she is out of mushrooms');

      expect(function(){
        err.because('she has enough mushrooms');
      }).to.throwException(function (ex) {
        expect(ex).to.have.property('code', 'cannot_overwrite_reason');
      });

    });

  });

  //
  //
  describe('data attributes', function(){
    //
    //
    it('should add a reason to the exception', function(){

      var err = Cannot('fly into', 'the sky').addData({
        key: 'value'
      });

      expect(err).to.have.property('data');
      expect(err.data).to.be.an('object');
      expect(err.data).to.have.property('key', 'value');

    });

  });

  //
  //
  describe('info attributes', function(){
    //
    //
    it('should add info to the message if given', function(){

      var err = Cannot('fly into', 'the sky').info('additional stuff');

      expect(err).to.have.property('_infoStr');
      expect(err._infoStr).to.be.a('string');
      expect(err._infoStr).to.be('additional stuff');
      expect(err.message).to.be('I could not fly into the sky. (No reason) (additional stuff)');
    });

  });

  //
  //
  describe('stacked info attributes', function(){
    //
    //
    it('should add info to the message if given', function(){

      var err1 = Cannot('overcome', 'gravity');
      var err = Cannot('fly into', 'the sky').info('additional stuff').because(err1);

      expect(err).to.have.property('_infoStr');
      expect(err._infoStr).to.be.a('string');
      expect(err._infoStr).to.be('additional stuff');
      expect(err.message).to.be('I could not fly into the sky (additional stuff), because I could not overcome gravity. (No reason)');
    });

  });
});
