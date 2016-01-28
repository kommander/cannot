//
// Test solve extension
//

// //
// //
// describe('Unhandled', function(){
//   //
//   // 
//   it('Should include unhandled exceptions into next message', function(done){

//     var err = new Cannot('send', 'letter', 'it was raining');

//     err._throw = sinon.spy();

//     Cannot._unhandled.should.have.lengthOf(1);

//     var followErr = new Cannot('follow', 'up', 'of unhandled exceptions');
//     expect(err._throw.callCount).to.be(0);

//     err.handle()
//     followErr.handle();

//     done();
//   });

// });

// //
// //
// describe('automatic handling', function(){
//   //
//   // 
//   it('should be able to turn off for explicit error handling', function(){

//     // Switch to explicit handling
//     Cannot.config({
//       automaticHandle: false
//     });

//     var err = Cannot('send', 'letter').because('it was raining');

//     Cannot._unhandled.should.have.lengthOf(1);

//     expect(err.handled).to.not.be.ok();

//     // Access automatic handlers
//     expect(err).to.have.property('code');      
//     expect(err).to.have.property('action');      
//     expect(err).to.have.property('subject');      
//     expect(err).to.have.property('reason');      
//     expect(err).to.have.property('message');      
//     expect(err).to.have.property('stackMessage');

//     expect(err.handled).to.not.be.ok();

//     err.handle();

//     // Switch back to automatic handling
//     Cannot.automaticHandle = true;
//   });

// });