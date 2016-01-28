//
// Test timeout extension
//

//
//
// describe('Timeout', function(){
//   var clock;
//   before(function () { clock = sinon.useFakeTimers(); });
//   after(function () { clock.restore(); });

//   //
//   // Exceptions are expected to be handled and considered as handled when the "code" property was read
//   it('Should throw the exception if not handled in time', function(done){
    
//     var err = new Cannot(
//       'wait',
//       'to be thrown',
//       'I am very impatient;'
//     );

//     err._throw = sinon.spy();

//     clock.tick(3100);

//     // Replace the _throw method to test if it was called
//     expect(err.code).to.be('cannot_wait_to_be_thrown');
//     expect(err._throw.callCount).to.be(1);
//     done();
    
//   });

//   //
//   // 
//   it('Should not throw the exception anymore when the code property was used', function(done){
    
//     var err = new Cannot(
//       'wait',
//       'to be thrown',
//       'I am very impatient;'
//     );

//     expect(err.code).to.be('cannot_wait_to_be_thrown');

//     // Replace the _throw method to test if it was called
//     err._throw = sinon.spy();

//     clock.tick(3100);

//     expect(err._throw.callCount).to.be(0);
//     done();
    
//   });

// });