Cannot
=========
_A broken promise resolver._

Aiding in creating consistently human readable messages without compromising machine processing ability. _Cannot_ extends the base _Error_, can be thrown and behaves just like expected. With a sweet syntax.

[![Build Status](https://travis-ci.org/kommander/cannot.png)](https://travis-ci.org/kommander/cannot) [![Coverage Status](https://coveralls.io/repos/github/kommander/cannot.js/badge.svg?branch=master)](https://coveralls.io/github/kommander/cannot.js?branch=master)

**Install**   
```
$ npm install cannot
```

**Core**  
An error can be expressed by calling `cannot(verb, object)` as a function which will return a `Broken` instance. A `Broken` instance can also be `thrown` like a generic `Error`.
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
`Cannot` follows a very simple syntax. It helps you to reason about what really went wrong by _avoiding inconsistent error codes_, to allow the implementation of recovery strategies.

```js
// Tell me what the problem is...
throw I.cannot('do', 'my work')
  .because(TheDatabase.cannot('find', 'what I was looking for')
    .because('something is broken'));
```

`Subject` cannot `perform verb/action` on `object/data`, because `it had a reason`.

The generated message aims to be as user friendly as possible, without spoiling risky information. All error specific data which you need to handle it elsewhere in your application, is derived from your simple declaration.  
The `because` api helps you to specify a reason, which allows you to stack error instances like a `Broken` as well.

## API
TODO: Table of contents
### Core
TODO

#### Stacking Errors
`Broken` instances can be stacked onto each other by handing them over as a reason to the next error.

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


## Recovery
`Brokens` should be handled and never ever be silently dropped. Most errors can be recovered from, which makes the overall user experience better and the application more stable as it becomes self sufficient. This approach supports a _Self Healing Architecture_, in which the application can _reason_ about what happened and choose a recovery strategy.


### Code Editor Snippets
The package includes auto completion snippets for _Sublime Text 2_ to support the _Cannot.js_ paradigm.

# Contribute
## Develop
To start developing, check out this repository and do:

```
$ make dev
```

Installs the initial dev dependencies, sets up git hooks and checks linting to be able run mincov before you push. Happy hacking!

## Make
For all make targets see:
```
$ make help
```

## Tests
We are handling errors, not producing them. That said, it is unavoidable to run into issues, but a _100%_ test coverage helps making sure the demons don't return.
[Mocha](http://mochajs.org) is the test runner in use,
extended by [expect.js](https://github.com/Automattic/expect.js) and [should](https://shouldjs.github.io) within a [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development) setup.
```
$ make test
```

## Specs
To add a feature to development, write a test to add to the spec in a feature branch.
```
$ make specs
```

Creates the specs file. `cat specs`.

## Coverage

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
