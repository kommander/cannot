/**
 * Tests for: lib/core/core.js
 */

var expect = require('expect.js');
var sinon = require('sinon');
var events = require('events');
var EventEmitter = events.EventEmitter;

var Cannot = process.env.LIB_COV
   ? require('../cov/lib/cannot.js')
   : require('../lib/cannot.js');


describe('Cannot Exception', function(){

  //
  //
  describe('Construct', function(){
    
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
      var messageTest = err.message.match(/.*[\s]{1}could not load something at cannot.test.js on line\s[0-9]{1,5}\. \(No reason\)/ig);
      expect(messageTest).to.be.ok();
    });
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
      var messageTest = err.message.match(/.*[\s]{1}could not load something at cannot.test.js on line\s[0-9]{1,5}, because there is nothing to load./ig);
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
      var messageTest = err.message.match(/.*[\s]{1}could not load something at cannot.test.js on line\s[0-9]{1,5}, because fakeParent./ig);
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
      var messageTest = err.message.match(/.*[\s]{1}could not load something at cannot.test.js on line\s[0-9]{1,5}\n[\s]{1,8}because .*[\s]{1}could not connect to internet at cannot.test.js on line\s[0-9]{1,5}, because ground_zero./ig);
      expect(messageTest).to.be.ok();
    });


  });

  //
  //
  describe('Timeout', function(){
    var clock;
    before(function () { clock = sinon.useFakeTimers(); });
    after(function () { clock.restore(); });

    //
    // Exceptions are expected to be handled and considered as handled when the "code" property was read
    it('Should throw the exception if not handled in time', function(done){
      
      var err = new Cannot(
        'wait',
        'to be thrown',
        'I am very impatient;'
      );

      err._throw = sinon.spy();

      clock.tick(3100);

      // Replace the _throw method to test if it was called
      expect(err.code).to.be('cannot_wait_to_be_thrown');
      expect(err._throw.callCount).to.be(1);
      done();
      
    });

    //
    // 
    it('Should not throw the exception anymore when the code property was used', function(done){
      
      var err = new Cannot(
        'wait',
        'to be thrown',
        'I am very impatient;'
      );

      expect(err.code).to.be('cannot_wait_to_be_thrown');

      // Replace the _throw method to test if it was called
      err._throw = sinon.spy();

      clock.tick(3100);

      expect(err._throw.callCount).to.be(0);
      done();
      
    });

  });

  //
  //
  describe('Unhandled', function(){
    //
    // 
    it('Should include unhandled exceptions into next message', function(done){

      var err = new Cannot('send', 'letter', 'it was raining');

      err._throw = sinon.spy();

      Cannot._unhandled.should.have.lengthOf(1);

      var followErr = new Cannot('follow', 'up', 'of unhandled exceptions');
      expect(err._throw.callCount).to.be(0);

      err.handle()
      followErr.handle();

      done();
    });

  });

  //
  //
  describe('automatic handling', function(){
    //
    // 
    it('should be able to turn off for explicit error handling', function(){

      // Switch to explicit handling
      Cannot.automaticHandle = false;

      var err = Cannot('send', 'letter').because('it was raining');

      Cannot._unhandled.should.have.lengthOf(1);

      expect(err.handled).to.not.be.ok();

      // Access automatic handlers
      expect(err).to.have.property('code');      
      expect(err).to.have.property('action');      
      expect(err).to.have.property('subject');      
      expect(err).to.have.property('reason');      
      expect(err).to.have.property('message');      
      expect(err).to.have.property('stackMessage');

      expect(err.handled).to.not.be.ok();

      err.handle();

      // Switch back to automatic handling
      Cannot.automaticHandle = true;
    });

  });

  //
  //
  describe('Object prototype extension', function(){
    //
    // 
    it('should create a cannot', function(){

      function Alice(){}
      
      var alice = new Alice();
      var err = alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

      expect(err).to.have.property('object', 'Alice');
      expect(err).to.have.property('action', 'fly_into');
      expect(err).to.have.property('subject', 'the_sky');
      expect(err instanceof Error).to.be.ok();

    });

    //
    // 
    it('should be able to hook into', function(done){

      // Example hook to loose api for q promises
      Cannot.createHook(function(){
        if(this.context && this.context.reject){
          this.context.reject(this);
        }
      });

      function Alice(){}
      Alice.prototype.reject = function(err) {
        expect(err).to.have.property('object', 'Alice');
        expect(err).to.have.property('action', 'fly_into');
        expect(err).to.have.property('subject', 'the_sky');
        done();
      };
      
      var alice = new Alice();
      alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

    });

    //
    // 
    it('should be catchable on the object instance', function(done){

      function Alice(){}
      
      var alice = new Alice();

      alice.inform(function(err){
        expect(err).to.have.property('object', 'Alice');
        expect(err).to.have.property('action', 'fly_into');
        expect(err).to.have.property('subject', 'the_sky');
        done();
      });

      alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

    });

    //
    // 
    it('should be catchable on the object constructor', function(done){

      function Alice(){}
      
      var alice = new Alice();

      Alice.inform(function(err){
        expect(err).to.have.property('object', 'Alice');
        expect(err).to.have.property('action', 'fly_into');
        expect(err).to.have.property('subject', 'the_sky');
        done();
      });

      alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

    });

    //
    // 
    it('should give the constructor catch callback the instance that could not', function(done){

      function Database(name){
        this.name = name;
      }

      Database.inform(function(err, instance){
        expect(err).to.have.property('subject', 'user');
        expect(instance).to.be.an('object');
        expect(instance).to.have.property('name', 'dbName1');
        done();
      });

      var db1 = new Database('dbName1');

      db1.cannot('load', 'user');

    });

    //
    // 
    it('should be catchable on the object constructor', function(done){

      function Alice(){}
      
      var alice = new Alice();

      Alice.inform(function(err){
        expect(err).to.have.property('object', 'Alice');
        expect(err).to.have.property('action', 'fly_into');
        expect(err).to.have.property('subject', 'the_sky');
        done();
      });

      alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

    });

    //
    // 
    it('should be able to only listen to a certain action', function(done){

      function Alice(){}
      
      var alice = new Alice();

      var callback = sinon.spy(function(err){
        expect(err).to.have.property('action', 'kill');
        expect(callback.callCount).to.be(1);
        done();
      });

      alice.inform('kill', callback);

      alice.cannot('fly into', 'the sky', 'she is out of mushrooms');
      alice.cannot('kill', 'the red queen', 'she is too nice');

    });

    //
    // 
    it('should be able to only listen to a certain action on constructor', function(done){

      function Alice(){}
      
      var alice = new Alice();

      var callback = sinon.spy(function(err){
        expect(err).to.have.property('action', 'kill');
        expect(callback.callCount).to.be(1);
        done();
      });

      Alice.inform('kill', callback);

      alice.cannot('fly into', 'the sky', 'she is out of mushrooms');
      alice.cannot('kill', 'the red queen', 'she is too nice');

    });

    //
    // 
    it('should be able to only listen to a certain action/subject combination', function(done){

      function Alice(){}
      
      var alice = new Alice();

      var callback = sinon.spy(function(err){
        expect(err).to.have.property('action', 'kill');
        expect(err).to.have.property('subject', 'the_red_queen');
        expect(callback.callCount).to.be(1);
        done();
      });

      Alice.inform('kill', 'the red queen', callback);

      alice.cannot('fly into', 'the sky', 'she is out of mushrooms');
      alice.cannot('kill', 'the red queen', 'she is too nice');

    });

    //
    // 
    it('should emit an error event if with an event emitter hook', function(done){

      Cannot.createHook(function(){
       // Emit error event if wanted
        if(this.context && this.context instanceof EventEmitter){
          this.context.emit('error', this);
        }
      });

      function Alice(){}
      Alice.prototype.__proto__ = EventEmitter.prototype;
      
      var alice = new Alice();

      var callback = sinon.spy(function(err){
        expect(err).to.have.property('action', 'kill');
        expect(err).to.have.property('subject', 'the_red_queen');
        expect(callback.callCount).to.be(1);
        done();
      });

      alice.on('error', callback);

      alice.cannot('kill', 'the red queen', 'she is too nice');

    });

  });
  
  //
  //
  describe('because chain', function(){
    //
    // 
    it('should add a reason to the exception', function(){

      function Alice(){}
      
      var alice = new Alice();
      var err = alice.cannot('fly into', 'the sky').because('she is out of mushrooms');

      expect(err).to.have.property('reason', 'she_is_out_of_mushrooms');

    });

    //
    // 
    it('should have the reason available for catch callbacks', function(done){

      function Alice(){}
      
      var alice = new Alice();

      alice.inform(function(err){
        expect(err).to.have.property('reason', 'she_is_out_of_mushrooms');
        done();
      });

      alice.cannot('fly into', 'the sky').because('she is out of mushrooms');

    });

    //
    // 
    it('should throw an error when setting the reason twice', function(){

      function Alice(){}
      
      var alice = new Alice();

      var err = alice.cannot('fly into', 'the sky').because('she is out of mushrooms');

      expect(function(){
        err.because('she has enough mushrooms');
      }).to.throwException(function (ex) {
        expect(ex).to.have.property('code', 'cannot_overwrite_reason');
        err.handle();
      });

    });

  });
});
