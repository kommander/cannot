var Cannot = require('./lib/cannot.js');
var expect = require('expect.js');

function Alice(){}
      
      var alice = new Alice();
      var err = alice.cannot('fly into', 'the sky').info('additional stuff');

      // Handle exception explicitly
      err.handle();

      expect(err).to.have.property('_infoStr');
      expect(err._infoStr).to.be.a('string');
      expect(err._infoStr).to.be('additional stuff');
      expect(err.message).to.be('Alice could not fly into the sky at cannot.spec.js on line 575. (No reason) (additional stuff)');