cannot.js
=========

Easy and fun error handling, by enforcing human readable messages without compromising machine processing ability.

## Example

```javascript  
var err = Alice.cannot('attend', 'the party').because('she fell into a rabbit hole');  
// err.message       -> {String} "Alice could not attend the party, because she fell into a rabbit hole."  
// err.object        -> {String} "Alice"  
// err.action        -> {String} "attend"  
// err.subject       -> {String} "the_party"  
// err.reason        -> {String} "she_fell_into_a_rabbit_hole"
// err.context       -> {Object} Alice
```

So how is that applicable to a real world programming example?  

```javascript
var db = new Database();

var err = db.cannot('load', 'User').because('connection was lost');
// err.message       -> {String} "Database could not load User, because connection was lost."  
// err.object        -> {String} "Database"  
// err.action        -> {String} "load"  
// err.subject       -> {String} "user"  
// err.reason        -> {String} "connection_was_lost"
// err.context       -> {Object} db
```


## Creating Exceptions
An exception can be created from calling `Cannot()` as a function, or by calling `Object#cannot()`.
When using `Cannot()` standalone with default configuration, it tried to grab the object which `could not` perform an action from the stack trace.
Using the `Object#cannot` API extension though obviously has an object which `could not`.

## License

(The MIT License)

Copyright (c) 2013 Sebastian Herrlinger (https://github.com/kommander)

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