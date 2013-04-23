/**
 * Stacking errors with object methods example
 * This file is part of Cannot.js (https://github.com/kommander/cannot.js)
 */
var Cannot = require('../');

/**
 * Mockup Database
 */
function Database(){}

Database.prototype.loadUser = function(cb) {
	var err = this.cannot('load', 'User').because('it is just a mockup');
  cb(err);
};

/**
 * Mockup user model
 */
function UserModel(database){
	this.db = database;
}

UserModel.prototype.init = function() {
  var self = this;
	this.db.loadUser(function(err, user){
    //                       |____________ bubbling up the error
    //                                   |
    self.cannot('init', 'data').because(err);
  });
};

// Not really handling the error...
var errorHandler = function(err){
  console.log(err.message);
}

// Setup a database mockup to be used with the user model
var dbMock = new Database();

// Create a user model and listen for errors
var user1 = new UserModel(dbMock);
user1.inform(errorHandler);

// Try to initialize user model with data from db
user1.init();

// Expected output:
// UserModel could not init data at stacking-errors-object.js on line 28
//     because Database could not load User at stacking-errors-object.js on line 13, because it is just a mockup.
Cannot.stackActive = false;

var err1 = Cannot('do', 'what I should do');
var err2 = Cannot('do', 'what I should do').because(err1);
var err3 = Cannot('do', 'what I should do').because(err2);

console.log(err3.message);