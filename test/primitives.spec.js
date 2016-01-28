//
// Test primitives extension
//

// //
// //
// describe('Object prototype extension', function(){
//   //
//   // 
//   it('should create a cannot', function(){

//     function Alice(){}
    
//     var alice = new Alice();
//     var err = alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

//     expect(err).to.have.property('object', 'Alice');
//     expect(err).to.have.property('action', 'fly_into');
//     expect(err).to.have.property('subject', 'the_sky');
//     expect(err instanceof Error).to.be.ok();

//   });

//   //
//   // 
//   it('should be able to hook into', function(done){

//     // Example hook to loose api for q promises
//     Cannot.createHook(function(){
//       if(this.context && this.context.reject){
//         this.context.reject(this);
//       }
//     });

//     function Alice(){}
//     Alice.prototype.reject = function(err) {
//       expect(err).to.have.property('object', 'Alice');
//       expect(err).to.have.property('action', 'fly_into');
//       expect(err).to.have.property('subject', 'the_sky');
//       done();
//     };
    
//     var alice = new Alice();
//     alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

//   });

//   //
//   // 
//   it('should be catchable on the object instance', function(done){

//     function Alice(){}
    
//     var alice = new Alice();

//     alice.inform(function(err){
//       expect(err).to.have.property('object', 'Alice');
//       expect(err).to.have.property('action', 'fly_into');
//       expect(err).to.have.property('subject', 'the_sky');
//       done();
//     });

//     alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

//   });

//   //
//   // 
//   it('should be catchable on the object constructor', function(done){

//     function Alice(){}
    
//     var alice = new Alice();

//     Alice.inform(function(err){
//       expect(err).to.have.property('object', 'Alice');
//       expect(err).to.have.property('action', 'fly_into');
//       expect(err).to.have.property('subject', 'the_sky');
//       done();
//     });

//     alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

//   });

//   //
//   // 
//   it('should give the constructor catch callback the instance that could not', function(done){

//     function Database(name){
//       this.name = name;
//     }

//     Database.inform(function(err, instance){
//       expect(err).to.have.property('subject', 'user');
//       expect(instance).to.be.an('object');
//       expect(instance).to.have.property('name', 'dbName1');
//       done();
//     });

//     var db1 = new Database('dbName1');

//     db1.cannot('load', 'user');

//   });

//   //
//   // 
//   it('should be catchable on the object constructor', function(done){

//     function Alice(){}
    
//     var alice = new Alice();

//     Alice.inform(function(err){
//       expect(err).to.have.property('object', 'Alice');
//       expect(err).to.have.property('action', 'fly_into');
//       expect(err).to.have.property('subject', 'the_sky');
//       done();
//     });

//     alice.cannot('fly into', 'the sky', 'she is out of mushrooms');

//   });

//   //
//   // 
//   it('should be able to only listen to a certain action', function(done){

//     function Alice(){}
    
//     var alice = new Alice();

//     var callback = sinon.spy(function(err){
//       expect(err).to.have.property('action', 'kill');
//       expect(callback.callCount).to.be(1);
//       done();
//     });

//     alice.inform('kill', callback);

//     alice.cannot('fly into', 'the sky', 'she is out of mushrooms');
//     alice.cannot('kill', 'the red queen', 'she is too nice');

//   });

//   //
//   // 
//   it('should be able to only listen to a certain action on constructor', function(done){

//     function Alice(){}
    
//     var alice = new Alice();

//     var callback = sinon.spy(function(err){
//       expect(err).to.have.property('action', 'kill');
//       expect(callback.callCount).to.be(1);
//       done();
//     });

//     Alice.inform('kill', callback);

//     alice.cannot('fly into', 'the sky', 'she is out of mushrooms');
//     alice.cannot('kill', 'the red queen', 'she is too nice');

//   });

//   //
//   // 
//   it('should be able to only listen to a certain action/subject combination', function(done){

//     function Alice(){}
    
//     var alice = new Alice();

//     var callback = sinon.spy(function(err){
//       expect(err).to.have.property('action', 'kill');
//       expect(err).to.have.property('subject', 'the_red_queen');
//       expect(callback.callCount).to.be(1);
//       done();
//     });

//     Alice.inform('kill', 'the red queen', callback);

//     alice.cannot('fly into', 'the sky', 'she is out of mushrooms');
//     alice.cannot('kill', 'the red queen', 'she is too nice');

//   });

//   //
//   // 
//   it('should emit an error event if with an event emitter hook', function(done){

//     Cannot.createHook(function(){
//      // Emit error event if wanted
//       if(this.context && this.context instanceof EventEmitter){
//         this.context.emit('error', this);
//       }
//     });

//     function Alice(){}
//     Alice.prototype.__proto__ = EventEmitter.prototype;
    
//     var alice = new Alice();

//     var callback = sinon.spy(function(err){
//       expect(err).to.have.property('action', 'kill');
//       expect(err).to.have.property('subject', 'the_red_queen');
//       expect(callback.callCount).to.be(1);
//       done();
//     });

//     alice.on('error', callback);

//     alice.cannot('kill', 'the red queen', 'she is too nice');

//   });

// });

// //
// // 
// it('should have the reason available for catch callbacks', function(done){

//   function Alice(){}
  
//   var alice = new Alice();

//   alice.inform(function(err){
//     expect(err).to.have.property('reason', 'she_is_out_of_mushrooms');
//     done();
//   });

//   alice.cannot('fly into', 'the sky').because('she is out of mushrooms');

// });
