/**
 * Stacking errors example
 * This file is part of Cannot.js (https://github.com/kommander/cannot.js)
 */
var Cannot = require('../');

// low level
function loadUser(cb){
	var err = Cannot('load', 'User').because('Database error');
  cb(err);
}

// middle level
function getFormattedUser(cb){
  loadUser(function(err){
    //                |_____________________________
    //                                             |
    var lvlErr = Cannot('format', 'User').because(err);
    cb(lvlErr);
  });
}

// high level
function getUserPage(cb){
  getFormattedUser(function(err){
    //                       |________________________
    //                                               |
    var lvlErr = Cannot('get', 'User page').because(err);
    cb(lvlErr);
  });
}

// Now we call the recursive stack and let the error bubble up
getUserPage(function(err){
  console.log(err.message);
});

// Expected Output:
// I could not get User page at stacking-errors.js on line 28
//     because I could not format User at stacking-errors.js on line 18
//     because loadUser could not load User at stacking-errors.js on line 9, because Database error.
