Cannot
=========

Simple error handling, aiding in creating consistently human readable messages without compromising machine processing ability. _Cannot_ extends the base _Error_, can be thrown and behaves just like expected. With a sweet syntax.

[![Build Status](https://travis-ci.org/kommander/cannot.js.png)](https://travis-ci.org/kommander/cannot.js) [![Coverage Status](https://coveralls.io/repos/github/kommander/cannot.js/badge.svg?branch=master)](https://coveralls.io/github/kommander/cannot.js?branch=master)

**Install**   
```
$ npm install cannot
```

**Core**  
An error can be created from calling `cannot(verb, object)` as a function which will return a `Cannot` instance. A `Cannot` instance can also be `thrown` like a generic `Error`.
```js  
throw cannot('attend', 'the party').because('I fell into a rabbit hole');  
// err.message   -> {String} "I could not attend the party, because I fell into a rabbit hole."  
// err.code      -> {String} "cannot_attend_the_party"  
// err.reason    -> {String} "i_fell_into_a_rabbit_hole"
```

**Handlor Extension** _(Candidate 1)_
```js
// Somewhere in the depths of technical debt...
throw Cannot('load', 'user').because('the database failed');

// Later that day...
.catch((error) => {
  error.handle('load', 'user', 'the database failed', () => {
    goAndRetryOneMoreTimePlease();
  });
});
```

**Handling Extension** _(Candidate 2)_
```js
// Somewhere in the depths of technical debt...
throw Cannot('load', 'user').because('the database failed');

// Later that day...
.catch((error) => {
  if (error.is.cannot('load', 'user').because('the database failed')) {
    goAndRetryOneMoreTimePlease();
  }
});
```

## Semantics
`Cannot.js` follows a very simple syntax. It makes you think about what really went wrong and helps you to _avoid inconsistent error codes_.

`Subject` cannot `perform verb/action` on `object`, because `it had a reason`.

The generated message aims to be as user friendly as possible, without you having to write it manually. All error specific data which you need to handle it elsewhere in your application, is derived from your simple declaration.  
The `because` api helps you to specify a reason, which allows you to pass on error objects as well.

## API
TODO: Table of contents
### Core
TODO

#### Stacking Errors
`Cannot` instances can be stacked onto each other by handing them over as a reason to the next error.

```javascript
var err1 = Cannot('do', 'what I should do');
var err2 = Cannot('do', 'what I should do').because(err1);
var err3 = Cannot('do', 'what I should do').because(err2);

console.log(err3.message);
```

This should produce the following output:  
```
I could not do what I should do
    because I could not do what I should do
    because I could not do what I should do. (No reason)
```

For more information on stacking errors, have a look at the [examples](https://github.com/kommander/cannot.js/tree/master/examples)

### Handlor Extension
TODO
### Reasoning Extension
TODO
### Extending the core
TODO


## Reasons
Throwing errors without a reason doesn't make sense, does it? So  the majority of errors have a reason which is known, like "because the database had a hiccup" or "the network was down". _Cannot_ errors support _reasons_ to make handling them easier than reacting to a single error code of "user_loading_failed" or "connection_failure". _Cannot_ errors gently remind you that there always is a reason for an error, by adding "(No reason)" to the error message, if no reason is given.


## Enforcing Error Handling
Errors should be handled and never ever be silently dropped. Most errors can be recovered from, which makes the overall user experience better and the application more stable as it becomes self sufficient. This approach supports a _Self Healing Architecture_, in which the application can _reason_ about what happened and react accordingly.


### Code Editor Snippets
The package includes auto completion snippets for _Sublime Text 2_ to support the _Cannot.js_ paradigm.

# Contribute
## Develop
To start developing, check out this repository and do:

```
$ make dev
```

_make dev_ installs the initial dev dependencies and sets up git hooks, to run tests before you can push. Happy hacking!

## Tests & Coverage
We are handling errors, not producing them. That said, it is unavoidable to run into issues, but a _100%_ test coverage helps making sure the demons don't return.
[Mocha](http://mochajs.org) is the test runner in use,
extended by [expect.js](https://github.com/Automattic/expect.js) and [should](https://shouldjs.github.io) within a [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development) setup.
```
$ make test
```

To generate a test coverage report, it uses [istanbul](https://gotwarlost.github.io/istanbul/).
```
$ make coverage
```

## License

(The MIT License)

Copyright (c) 2016 Sebastian Herrlinger (https://github.com/kommander)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
