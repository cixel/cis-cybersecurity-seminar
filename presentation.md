autoscale: true
theme: Next, 3
code: Hack
slidenumbers: true

[.header: alignment(center)]
# [fit] Spying on your Code

# [fit] Instrumentation in Node.js

---

[.autoscale: true]

[.header: alignment(center)]
# Hi everyone!

### I'm Ehden

[.list: bullet-character(  )]
- node agent engineer, Contrast Security
- ![inline](Contrast-Logo-4C.svg)
- [github.com/cixel](https://github.com/cixel)
- [ehden@contrastsecurity.com](mailto:ehden@contrastsecurity.com)
- ![inline original 200%](Contrast-Logo-4C.pdf)

^ This is me, my name is Ehden

^ The calendar event for the cybersecurity seminar says i'm a girl---sorry to disappoint
]
^ I work on the node agent at Contrast Security.
we're an application security startup based out of Baltimore

^ We write software that sits inside running web apps and makes them report their own security problems at runtime

^ I'm joined today by [the contrast people]
They don't go here, they're here to make this even more uncomfortable for me

^ Arshan, who is one of the cofounders.
He's the one who put me up to this, so if you hate this, blame him

---

[.autoscale: true]

[.header: alignment(center)]
# Hi everyone!

### I'm Ehden

[.list: bullet-character(  )]
- node agent engineer, Contrast Security
- Towson alum!
- [github.com/cixel](https://github.com/gilday)
- [ehden@contrastsecurity.com](mailto:ehden@contrastsecurity.com)
- ![inline original 200%](Contrast-Logo-4C.pdf)

^ Most of us here are Towson alum

^ happy to be back

^ grateful for the opportunity to speak, stay connected to the department and the students

^ we'll probably hang around a bit after the talk

^ come talk to us, ask questions, etc., we want to meet all you

^ that's why we're here, that's why i'm doing this

^ open to questions during the talk, so if you've got anything please just raise your hand, i'll try to pay attention

---

# Instrumentation in Node.js

^ ## ![inline](node.png) 📏🔬📐 ![inline](node.png)

^ So the subject of the talk is Instrumentation in node

^ So I'm gonna start by laying out a couple of basic definitions

---

[.background-color: #f0f0f0]
![left 25%](node.png)

# JavaScipt. On the server.

^ First is Node.js. If you don't know what it is, there's a good chance you've at least seen it.

^ It's JavaScript, but not in the browser

^ Now JavaScript is based on a spec, called ECMAScript

---

```javascript
document.getElementByID('snippet')
```

^ Things we typically associate with JavaScript like ability to interact with elements in HTML

^ Not actually part of that spec

^ Belong to a different spec, called the DOM spec

^ They usually aren't even implemented in JS

^ C++ or whatever language the browser is written in

---

[.background-color: #f0f0f0]
![inline](v8.png)
![inline](node.png)

^ So what Node did is it took Chrome's JavaScript engine

^ On top of it, instead of putting a bunch of browser APIs, they put in a bunch of other APIs, to help you do things like talk to the filesystem

^ spawning child processes, opening socket connections. Y'know, classic OS and back-end stuff.

---

![left filtered](grandma.jpg)

[.autoscale: true]

- Assertion Testing
- Async Hooks
- Buffer
- C++ Addons
- C/C++ Addons - N-API
- Child Processes
- Cluster
- Command Line Options
- Console
- Crypto
- Debugger
- Deprecated APIs
- DNS
- Domain
- ECMAScript Modules
- Errors
- Events
- File System
- Globals
- HTTP
- HTTP/2
- HTTPS
- Inspector
- Internationalization
- Modules
- Net
- OS
- Path
- Performance Hooks
- Process
- ...

^ And out of the box, it gives quite a bit of these APIs

^ For just about whatever

^ But not all at once, all the time

^ So to help you manage these and pull in only what you need, it also added a module system

^ OPTIONAL: In browser, different libraries, when loaded, are pretty just stacked on top of one another globally
So node does this a bit more neatly

---

```javascript
const thing = require('./thing');

const thingy = thing(1);

module.exports = {
	thingy
};
```

^ that module system looks like this

^ to import a module, you call require

^ and to export something as a module, when your code is imported, you modify module.exports

---

[.code-highlight: 1, 9]

```javascript
(function (exports, require, module, __filename, __dirname) { 
	const thing = require('./thing');

	const thingy = thing(1);

	module.exports = {
		thingy
	};
});
```

^ this is what node does behind the scenes whenever your file is being loaded to make that possible

^ it just wraps it all and injects a bunch of things, then it calls your file like a function

^ and when that function ends, it throws 'exports' in a cache

---

[.code-highlight: all]
[.code-highlight: 2]
[.code-highlight: 3]
[.code-highlight: 5-8]
[.code-highlight: 6-7]
[.code-highlight: 10-12]

```javascript
// demo.js
const express = require('express');
const app = express();

app.get('/hi', function(req, res) {
  const name = req.query.name;
  res.send('hello, ' + encodeURIComponent(name));
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});
```

^ this is what a simple, barebones web app looks like in nodejs
[BUILD]

^ first thing we do is use that import system i mentioned to pull in a nifty http framework library called express
[BUILD]

^ then we call that thing we just loaded, and it returns an http listener we call app
[BUILD]

^ then we register a handler for slash hi
[BUILD]

^ which pulls a field called name out of the query string and sends back hello, name as a response
[BUILD]

^ then we tell the server to start listening on port 3000

---

```bash
$ node demo.js
Example app listening on port 3000!
```

^ you run it like this

---

```bash
$ node demo.js
Example app listening on port 3000!
```

![inline 200% left](name.png)

^ and this is what that ends up looking like if you set name to towson

---

# Instrumentation in
# ✅ Node.js

^ Ok so that's Node.js

---

# *Instrumentation* in
# ✅ Node.js

^ Time to start talking about instrumentation

^ First, what the heck is it


---

# 🎷🎸🎻🥁🎺

![right](i13n.png)

^ If you look up the definition in google, it's got a couple

---

# 📏🔬📐

![right](i13n-x.png)

^ The 2nd is the one we're after here

^ [take a moment, read it off]

^ measuring instruments regarded collectively

^ now that's a definition that uses most of the word we're trying to define in the definition

^ so let's look that up

---

# 📏

![right 100%](instrument-def.png)

^ that's better

^ so it's *stuff* to measure what a *thing* is doing

^ Now instrumentation is everywhere in other engineering disciplines

^ Manufacturing plants will have sensors at basically every point along the factory line

^ Nobody makes cars anymore that don't have very sophisticated diagnostic instruments everywhere

^ Software engineering is still sort of lagging behind, in my opinion

^ But that's changing

---

## Instrumentation

Used for...

- logging
- performance monitoring
- debugging

^ Today in software, it's used for a wide variety of things

^ Originally used mostly for adding logging

^ Now used for things like performance monitoring

^ can be used to find certain issues that can crop up at runtime, such as bad memory use or race conditions

---

## Instrumentation

Used for...

- logging
- performance monitoring
- debugging

^ At Contrast, we use instrumentation to find vulnerabilities in web applications

^ To explain that, I'm gonna steal an analogy from someone else who works at Contrast

---

[.background-color: #ffffff]

![left 25%](jeff-stance.jpg)

^ His name is Jeff Williams

^ I'm gonna throw down a few quick facts about Jeff Williams, build him up so you know he's a good person to steal analogies from

---

[.background-color: #ffffff]

[.build-lists: true]

![left 25%](jeff-stance.jpg)


Facts about Jeff Williams:

- Cofounder and CTO of Contrast

- Has like 80 degrees

- Was the global OWASP chair for almost a decade

- Knows a ton about pen testing and application security

- Given a crazy amount of talks about appsec

^ He's actually the other cofounder and our CTO

^ he was the chair of OWASP for a while, and he's been around in the AppSec space for a long time

^ knows a ton about penn testing and application security

^ and has given probably dozens of talks on the subject at different security conferences

^ which is great, and he's super nice, but invariably, one thing crosses the minds of everyone who meets him:

---

[.background-color: #ffffff]

![left 47%](jeff-stance.jpg)

^ "damn, that guy is really tall"

Lasting impressions about Jeff Williams:

- *"tall enough to catch a goose with a rake"* —an actual person

---

[.background-color: #ffffff]

![left 47% original](jeff-stance.jpg)
![100% original](bball.png)

^ he also happens to really like basketball

Bonus fact:

- loves basketball

---

[.background-color: #ffffff]

![left 47% original](jeff-stance.jpg)
![100% original](bball.png)

^ and so when people see him walking around at a security conference, literally holding a basketball

^ nobody questions it

^ which is probably because they either know him, or they think "ya that guy is super tall, why wouldn't he have a basketball, everything checks out here"

^ but the real reason he had this ball is because he used to do this talk where he'd get up to the podium and say
[NEXT SLIDE]

Bonus fact:

- loves basketball

Bonus bonus fact:

- doesn't know he's in these slides, please don't tell him

---

[.background-color: #ffffff]
[.list: bullet-character(  )]

### *This is not just a basketball.*
### *This is also a basketball coach.*

- ![inline](Contrast-Logo-4C.svg)

^ This is not just a basketball, this is also a basketball coach

^ He's go on to explain that his ball was a special ball

^ It had a bunch of sensors in it

^ As you play, it collects info about how it's used, sends that info to your phone

^ And the app in your phone already has in it info about how good players use the ball
[next]


![100% original](bball.png)

---

[.background-color: #ffffff]
[.list: bullet-character(  )]

### *This is not just a basketball.*
### *This is also a basketball coach.*

- ![inline](Contrast-Logo-4C.svg)

^ > This is not just a basketball, this is also a basketball coach


![100% original](thinking-bball-c.png)

^ It has this model of known good basketball

^ So the app says "here's what good players do, and here's whatever you did. so here's where you need to improve"

^ Now to be clear wans't just a prop, jeff actually had this like $200 basketball with a bunch of gyroscopes and accelerometers and stuff

^ and so jeff used this analogy to kkind of explain what Contrast does

^ where instead of a basketball, it's a web application

---

[.background-color: #ffffff]
![100% original](thinking-bball-c.png)

^ I stole this analogy because I have no shame

^ and because I'm not a very creative person

^ and because it's really good

^ But also because there's an aspect of this analogy that I feel is often passed over
If you were tasked with building this basketball
Like, as a mechanical engineer or whatever
You wouldn't ~really~ need to know that much about basketball
It would definitely help to have an appreciation for the sport, but
At the end of the day, your focus is on the physical properties of the ball

---

[.background-color: #ffffff]
![100% original](thinking-bball-c.png)

^ It has to be accurate but it can't weight 8 pounds 

^ or nobody will use it

^ And if they did use it, the app would just be like "you suck at free throws with an 8 pound ball"
and that's not a particularly useful metric

^ There are like 5 people from contrast in the room

^ There are probably not that many security experts in here
Maybe a few. I'm not one of them.
Arshan probably is, O'Leary probably is.

^ But the bigger point is: I work for an AppSec company
I work on an AppSec tool
But I don't reeeally consider my job, day-to-day, to be AppSec

^ I consider it to be this stuff

---

## The next 20 minutes of your life

- Monkey patches
- AST rewrites
- Object proxies

^ These are our sensors, or the tools we use for creating sensors

^ and I'm gonna go through each of them

---

## Monkey patching

*A monkey patch is a way for a program to __extend or modify__ supporting system software locally (affecting __only the running instance__ of the program).*[^1]

![100%](see-no-evil.png) ![100%](hear-no-evil.png) ![100%](speak-no-evil.png)

[^1]: [Wikipedia](https://en.wikipedia.org/wiki/Monkey_patch)

^ Monkey Patching. Kind of a weird term.

^ Just means changing the behavior of a program at runtime, without actually changing the source code

^ mostly in dynamic languages like python, ruby, javascript

^ It's not only done in those, it's just easiest in those

---

## Monkey patching

![100%](see-no-evil.png) ![100%](hear-no-evil.png) ![100%](speak-no-evil.png)

Used to...

- test
- change behavior of other people's code
- quickly patch security issues

^ one of the most common uses is in testing, to stub out APIs

^ mock some behaviors so that you can focus on testing a very specific bit of functionality

^ but it's also used for other things

^ except for maybe in testing, pretty frowned upon in general, and you'll see why

---

^ absurdly easy in js

^ can just redefine a function

^ here's a small demo of this on my node repl to instrumentation console.log

^ [EXPLAIN THE CODE]

^ i save the console.log function to a variable

^ then reassign to it a function which toStrings and reverses the first argument

^ then it invokes the original console.log function with the changed arguments

^ so the ability to do this is kinda one of those things that makes javascript awesome as much as it makes it terrible

^ but, it's an absurdly powerful tool for writing instrumentation

![inline 120%](patch-repl.png)

---

[.code-highlight: all]
[.code-highlight: 2]

```javascript
// demo.js
const express = require('express');
const app = express();

app.get('/hi', function(req, res) {
  const name = req.query.name;
  res.send('hello, ' + name);
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});
```

^ let's look at a more useful example

^ here's that app I showed you a bit ago

^ it looks tiny but the top it's pulling in this library called express BUILD

^ apps like this that look small but really do a lot are kinda like icebergs

^ so we want to see what to see this iceberg actually looks like

---

[.code-highlight: all]

^ here's how you could do that

^ in node.js, each loaded file is treated as a 'module'

^ so we want to get access to the method responsible for compiling the files into these module objects

^ and so we monkey patch that to see what's going on

```javascript
// instrumentation/monkey.js
const Module = require('module');

const compile = Module.prototype._compile;
Module.prototype._compile = function(content, filename) {
	console.log(filename);
	const r = compile.apply(this, arguments);
	return r;
}
```

---

[.code-highlight: 2]
^ so, you require Module
it's one of the built-ins node gives you
it includes the definition for this module object that we're trying to patch


```javascript
// instrumentation/monkey.js
const Module = require('module');

const compile = Module.prototype._compile;
Module.prototype._compile = function(content, filename) {
	console.log(filename);
	const r = compile.apply(this, arguments);
	return r;
}
```

---

[.code-highlight: 4-9]
^  the rest is kinda the same as what i showed with console.log

^ [EXPLAIN]

^ log the filename, then call original function and return its result

```javascript
// instrumentation/monkey.js
const Module = require('module');

const compile = Module.prototype._compile;
Module.prototype._compile = function(content, filename) {
	console.log(filename);
	const r = compile.apply(this, arguments);
	return r;
}
```

---

```bash
$ node -r ../instrumentation/monkey.js demo.js
```

^ and here's what that looks like when we run it on our demo app

^ we run it with this new command

^ [explain -r flag]
tells node load this file before starting the app
that lets us start and do whatever it is we need to do before the app runs
and that way we don't miss anything

![right fill](output1.png)

^ monkey patching itself is pretty simple in node, but you kinda need to know a bit before you do it


---

[.code-highlight: 4-9]
```javascript
// instrumentation/monkey.js
const Module = require('module');

const compile = Module.prototype._compile;
Module.prototype._compile = function(content, filename) {
	console.log(filename);
	const r = compile.apply(this, arguments);
	return r;
}
```
^ Half the work here is actually finding this compile function to patch

^ That's the part of this that I sorta pulled out of the oven pre-baked

^ But when you want to patch you may need to do a bit of research to figure out what you're patching

^ What arguments does it accept? What is it supposed to return?
because if you don't know these things ahead of time, you risk breaking the function
and javascript is more than happy to let you break the function

^ And so monkey patching kinda has to be a very deliberate thing to be of much use.

^ What if you wanted something much wider-reaching?

---

# AST Rewriting

![right](tree.jpg)

^ You could start by rewriting the source code

---

![right](tree.jpg)

# Abstract Syntax Trees

> an abstract syntax tree (AST), or just syntax tree, is a tree representation of the abstract syntactic structure of source code written in a programming language.
--Wikipedia

^ let's start with another definition

^ this time we use wikipedia

^ ... we got ourselves another definition that includes most of the term behind defined

---

## Abstract Syntax Trees

![inline](ast-ex1.png)

---

## Abstract Syntax Trees

![inline](ast-ex2.png)

---

## Abstract Syntax Trees

![inline](ast-ex3.png)

---

![right fit](ast-ex0-dark.png)

```json
{
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "a"
                    },
                    "init": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "Literal",
                            "value": 1,
                            "raw": "1"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 1,
                            "raw": "1"
                        }
                    }
                }
            ],
            "kind": "var"
        }
    ],
    "sourceType": "script"
}
```
^ (next slide will lag because of the size of the code snippet)

^ this is the full AST structure for that little blob

---

 ```json
{
    "type": "Program",
    "body": [
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "app"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "get"
                    }
                },
                "arguments": [
                    {
                        "type": "Literal",
                        "value": "/hi",
                        "raw": "'/hi'"
                    },
                    {
                        "type": "FunctionExpression",
                        "id": null,
                        "params": [
                            {
                                "type": "Identifier",
                                "name": "req"
                            },
                            {
                                "type": "Identifier",
                                "name": "res"
                            }
                        ],
                        "body": {
                            "type": "BlockStatement",
                            "body": [
                                {
                                    "type": "VariableDeclaration",
                                    "declarations": [
                                        {
                                            "type": "VariableDeclarator",
                                            "id": {
                                                "type": "Identifier",
                                                "name": "name"
                                            },
                                            "init": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "MemberExpression",
                                                    "computed": false,
                                                    "object": {
                                                        "type": "Identifier",
                                                        "name": "req"
                                                    },
                                                    "property": {
                                                        "type": "Identifier",
                                                        "name": "query"
                                                    }
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "name"
                                                }
                                            }
                                        }
                                    ],
                                    "kind": "const"
                                },
                                {
                                    "type": "ExpressionStatement",
                                    "expression": {
                                        "type": "CallExpression",
                                        "callee": {
                                            "type": "MemberExpression",
                                            "computed": false,
                                            "object": {
                                                "type": "Identifier",
                                                "name": "res"
                                            },
                                            "property": {
                                                "type": "Identifier",
                                                "name": "send"
                                            }
                                        },
                                        "arguments": [
                                            {
                                                "type": "BinaryExpression",
                                                "operator": "+",
                                                "left": {
                                                    "type": "Literal",
                                                    "value": "hello, ",
                                                    "raw": "'hello, '"
                                                },
                                                "right": {
                                                    "type": "CallExpression",
                                                    "callee": {
                                                        "type": "Identifier",
                                                        "name": "encodeURIComponent"
                                                    },
                                                    "arguments": [
                                                        {
                                                            "type": "Identifier",
                                                            "name": "name"
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        "generator": false,
                        "expression": false,
                        "async": false
                    }
                ]
            }
        }
    ],
    "sourceType": "script"
}
```

![](donotwant.jpg)

^ and this is the AST for our little demo app

^ i know you can't read that or even really see it

^ actually this isn't the entire app, this is just the 4 lines for responding to the request to '/hi'

---

# AST Rewriting

1. parse source code into AST
1. traverse tree, changing whatever you want
1. print the tree back out as source

![right 100%](owl.jpg)

^ Here's the high level for how we rewrite source code

^ every time a file is loaded, you build an abstract syntax tree, for it

^ you spider this tree, and change the nodes you care about

^ then you take this modified tree and turn it back into source code

^ we'll go through all of that again, step by step

^ in this next slide, i'm gonna show you all the code i wrote to parse a string of code into an abstract syntax tree

---

^ [WATER BREAK]

^ Right? Pretty crazy

^ I cannot stress enough how much you don't want to do this yourself

^ Things change too quickly, JavaScript syntax is kind of gross

^ there are some really really large open source projects with critical dependencies on being able to parse AST

^ it's not only rewriters that need to parse and traverse AST---also things like linters

![fit 132% original](flying-edit.png)

```javascript
// Step 1: Parse code into AST
const ast = esprima.parse(code);
```

---

```javascript
// Step 2: Traverse the AST and change what we want
const after = estraverse.replace(before, {
	enter(node) {
		switch(node.type) {
			case 'FunctionDeclaration':
				const name = node.id && node.id.name || 'anonymous';
				const start = node.loc.start;
				const rel = path.relative(process.cwd(), filename);
				const loc = `${name} (${rel}:${start.line}:${start.column})`;

				node.body.type === 'BlockStatement' && node.body.body.unshift({
					'type': 'ExpressionStatement',
					'expression': {
						'type': 'CallExpression',
						'callee': {
							'type': 'MemberExpression',
							'computed': false,
							'object': {
								'type': 'Identifier',
								'name': 'console'
							},
							'property': {
								'type': 'Identifier',
								'name': 'log'
							}
						},
						'arguments': [
							{
								type: 'Literal',
								value: loc
							}
						]
					}
				});
			// ...
		}

		return node;
	}
});
```

---

```javascript
// Step 3: Print the new AST
return escodegen.generate(after);
```

---

## Monkey patch + AST rewrite

```javascript
// instrumentation/index.js
Module.prototype._compile = function(content, filename) {
	arguments[0] = rewrite(content, filename);
	const r = compile.apply(this, arguments);
	return r;
}
```

^ Let's put the two things we've seen so far together

^ Instead of just logging the file name, we replace the content argument with whatever our rewriter makes

---

![200%](output2.png)

^ Now when we run the app with our instrumentation, our logs look like this

^ btw, I cropped the shit out of this, there's probably more than 2 thousand lines now

---

![right](tree.jpg)

## AST Rewriting

Used for...

- React, TypeScript
- Minification
- Prettification
- Refactoring
- Code coverage

^ "kind of js but not quite" languages

---

^ Let's go back to our demo

^ Now we're seeing a lot of what the app does, but we're still missing some pretty important things

^ Let's focus on this line [BUILD]. How do we watch property access if we want to see what data an app pulls off the request?

^ We can't really monkeypatch for that because those dot accessors aren't functions

^ AST rewriting COULD work but the rewrite would be involed, and you've have to rewrite a ton of stuff you probably won't need
JS ASTs really don't tell you enough to let you know that 'req' is actually a request object
So you kinda have to spray rewrites everywhere

^ and your instrumentation has to check at runtime whether the object you're accessing is a request or not

^ you'd probably have to add a ton of function calls to be able to do this as an AST rewrite

^ and that'd kill performance

[.code-highlight: all]
[.code-highlight: 6]

```javascript
// demo.js
const express = require('express');
const app = express();

app.get('/hi', function(req, res) {
  const name = req.query.name;
  res.send('hello, ' + name);
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});
```

---

# Proxy & Reflect

^ Object proxies are the last thing I'll talk about

^ They are really new to the language.

---

## Proxy

^ Object proxies are the last thing I'll talk about

^ They are really new to the language.

*Used to define custom behavior for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc).*[^2]

[^2]: [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

^ In short, proxies wrap objects and allow you to define behavior for intercepting a bunch of the basic operations you'd perform on an object

^ operations include setting, getting, and deleting properties, calling as a function, constructing, getting the prototype of, and so on

---

## Terminology

**target**: the object being wrapped

**trap**: method providing intercept behavior for an operation

**handler**: object which holds traps

^ a few definitions to be aware of

^ [MAYBE DRINK HERE]

---

[.code-highlight: all]
[.code-highlight: 1]
[.code-highlight: 3-17]
[.code-highlight: 4-16]
[.code-highlight: 19]
[.code-highlight: all]

^ here's an example of using a proxy to assimilate
[BUILD]

^ person is the target
[BUILD]

^ handler is... the handler
[BUILD]

^ and you can see that it holds a couple of methods, get and set. these are *traps* for getting and setting properties
[BUILD]

^ then we call new proxy, passing the target and handler
anything get or set to borg will invoke those traps we defined in the handler

```javascript
const person = new Person('Jean-Luc Picard');

const handler = {
	get(target, property, receiver) {
		if (property === 'name') {
			return 'Locutus of Borg';
		}

		return Reflect.get(...arguments);
	},

	set(target, property, value, receiver) {
		// Don't actually set.
		console.log('Resistance is futile.');
		return true;
	}
};

const borg = new Proxy(person, handler);
```

---

## Watching request reads

```javascript
const name = req.query.name;
```

1. Monkey-patch express, add intercept for every incoming request
1. Proxy `request.query` with a `get` trap

^ So here's what we're gonna do with proxies and it's gonna be dope

^ First we need to monkey-patch epxress

---

## Patching express

```javascript
const express = require('express');
// patch express()?
const app = express();
```

^ This is from our app. We want to patch that function express exports

^ That's different from what we've done so far, because

^ what we've done is change a function on an object by reassigning to that object

^ for this, we have to change the object itself (all function in js are objects)

^ so we take a slightly different approach

---

## Patching express

```javascript
const load = Module._load;
Module._load = function(filename) {
	let mod = load.apply(this, arguments);

	if (filename === 'express') {
		// woo!
	}

	return mod;
};
```

^ what we do is we patch module._load, which gets called by require

^ and inspect the filename for whenever express loads

^ and this code i've excluded is where we'd wrap the function

---
## Patching express

```javascript
const express = require('express');
const app = express();
console.log(Object.keys(express));
/* 
[
	application,
	request,
	response,
	Route,
	Router,
	json,
	query,
	static,
	urlencoded
]
*/
```

^ but there's another problem---express is a function and an object and it's got all these properties

^ so if we just wrap it in another function, we're gonna drop these other properties

---

## Patching express

[.code-highlight: 3-7]

```javascript
let mod = load.apply(this, arguments);
if (filename === 'express') {
	mod = new Proxy(mod, {
		apply(tar, thisArg, args) {
			return tar.apply(thisArg, args);
		}
	});
}
return mod;
```

^ proxies to the rescue

^ we trap apply, and this lets us change only how express gets called as a function

^ but all gets on all those other properties are untouched

---

## Watching requests

[.code-highlight: 3-13]
```javascript
mod = new Proxy(mod, {
	apply(tar, thisArg, args) {
		const app = tar.apply(thisArg, args);

		app.use(function(req, res, next) {
			req.query = new Proxy(req.query, {
				get(tar, prop, recv) {
					const val = Reflect.get(...arguments);
					console.log(`getting ${prop} from query: ${val}`);
					return val;
				}
			})
		});

		return app;
	}
});
```

^ now we have app, so we can call it like the app would to register a handler for all requests (called a middleware)

^ and in that handler, we redefine request.query as a Proxy, with a get trap

---

## Other fun stuff

```javascript
apply(tar, thisArg, args) {
	const app = tar.apply(thisArg, args);

	app.use(function(req, res, next) {
		req.query = new Proxy(req.query, {
			get(tar, prop, recv) {
				const val = Reflect.get(...arguments);
				data.queries.push({
					key: prop,
					val: v
				});
				return val;
			}
		})
	});

	app.get('/intrumentation/calls', function (req, res) {
		res.send(data.calls);
	});

	return app;
}
```

---

# Demo

---

[.build-lists: true]

## Proxy stuff I should mention

^ Proxies are pretty new and you don't see them in many places yet, but they've got a ton of potential for use in instrumentation and security

Interesting patterns:

- Recursive proxies[^3]
- Proxies on empty object
- Revocable proxies

[^3]: [Transparent Object Proxies for JavaScript](https://arxiv.org/pdf/1504.08100.pdf)

^ explain Recursive proxies, build

^ explain how wild it is that you can trap for properties which don't actually exist, can make mocks this way


---

## It's over

- instrumentation is awesome
- javascript is \__\_
- composition of monkey patches, AST rewrites, and proxies = $$

### Contact me:

- [ehden@contrastsecurity.com](mailto:ehden@contrastsecurity.com)
- [github.com/cixel](https://github.com/cixel)

---

[.autoscale: true]

# Image Credits

- Contrast Security: [https://www.contrastsecurity.com](https://www.contrastsecurity.com)
- Node.js Foundation: [https://nodejs.org/en/about/resources/](https://nodejs.org/en/about/resources/)
- [Slate](http://www.slate.com/articles/health_and_science/science/2017/06/the_mayor_of_redondo_beach_california_never_killed_a_tree_named_clyde.html)

