
```
v5.4.0
Checking behaviour.


  Core
    ✓ exposes isError
    ✓ Should create an exception from arguments
[Error: I could not load something, because there is nothing to load.]
Error: I could not load something, because there is nothing to load.
    at Context.<anonymous> (/Users/sherrlinger/cannot.js/test/cannot.spec.js:44:17)
    at callFnAsync (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runnable.js:338:8)
    at Test.Runnable.run (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runnable.js:290:7)
    at Runner.runTest (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:422:10)
    at /Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:533:12
    at next (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:342:14)
    at /Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:352:7
    at next (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:284:14)
    at Immediate._onImmediate (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:320:5)
    at processImmediate [as _immediateCallback] (timers.js:383:17)
    ✓ Should have a stack trace


Now using node v6.0.0 (npm v3.8.6)
Checking behaviour.


  Core
    ✓ exposes isError
    ✓ Should create an exception from arguments
Error: I could not load something, because there is nothing to load.
    at Context.it (/Users/sherrlinger/cannot.js/test/cannot.spec.js:44:17)
    at callFnAsync (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runnable.js:338:8)
    at Test.Runnable.run (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runnable.js:290:7)
    at Runner.runTest (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:422:10)
    at /Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:533:12
    at next (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:342:14)
    at /Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:352:7
    at next (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:284:14)
    at Immediate._onImmediate (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:320:5)
    at tryOnImmediate (timers.js:543:15)
    at processImmediate [as _immediateCallback] (timers.js:523:5)
Error: I could not load something, because there is nothing to load.
    at Context.it (/Users/sherrlinger/cannot.js/test/cannot.spec.js:44:17)
    at callFnAsync (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runnable.js:338:8)
    at Test.Runnable.run (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runnable.js:290:7)
    at Runner.runTest (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:422:10)
    at /Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:533:12
    at next (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:342:14)
    at /Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:352:7
    at next (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:284:14)
    at Immediate._onImmediate (/Users/sherrlinger/cannot.js/node_modules/mocha/lib/runner.js:320:5)
    at tryOnImmediate (timers.js:543:15)
    at processImmediate [as _immediateCallback] (timers.js:523:5)
```
Something new in the stack `at tryOnImmediate (timers.js:543:15)`
