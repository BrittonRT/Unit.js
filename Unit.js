/*
**  Unit.js
**
**  Dependencies: none
**  Copyright 2014 Britton Reeder-Thompson
*/
;'use strict';
Unit = (function(window, document) {
	/* -- PUBLIC -- */
	var Unit = {
			scripts:   {},
			loaded:    {},
			completed: {},
			failed:    {},
			load: function() {
				loaders.push(new Loader().load(arguments));
				return Unit;
			},
			require: function() {
				loaders.push(new Loader().require(arguments));
				return Unit;
			},
			then: function() {
				if (!loaders.length) throw new Error('You must call Unit.load() or Unit.require() before calling Unit.then()');
				var argsArray = arguments;
				loaders.push(new Loader());
				loaders[loaders.length-2].onDone([function() {
					this.load(argsArray);
				}.bind(loaders[loaders.length-1])]);
				return Unit;
			},
			fail: function(argsArray) {
				if (!loaders.length) throw new Error('You must call Unit.load() or Unit.require() before calling Unit.fail()');
				arguments = typeof argsArray == 'object' ? argsArray : arguments;
				loaders[loaders.length-1].onFail(arguments);
				return Unit;
			},
			done: function(argsArray) {
				if (!loaders.length) throw new Error('You must call Unit.load() or Unit.require() before calling Unit.done()');
				arguments = typeof argsArray == 'object' ? argsArray : arguments;
				loaders[loaders.length-1].onDone(arguments);
				return Unit;
			},
			finish: function() {
				Unit.scripts[getCurrentScriptName()].done();
				return Unit;
			}
		},
		loaders = [];
	/* -- PRIVATE -- */
	function Loader() {
		this.required  = false;
		this.loaded    = false;
		this.scripts   = {};
		this.successes = [];
		this.errors    = [];
		this.completed = 0;
		this.total     = 0;
		this.doneComplete = false;
		this.failComplete = false;
		this.on = {
			fail: [],
			done: []
		}
		this.id = ++Loader.c;
	};
	Loader.c = 0;
	Loader.prototype = {
		load: function(arguments) {
			console.log('loading', arguments);
			for (var i in arguments) { var argument = arguments[i];
				if (typeof argument != 'string') throw new Error('Arguments of Unit.load() must be string path names.');
				this.total++;
				argument += '.unit';
				if (Unit.completed[argument]) {
					this.scripts[argument] = Unit.scripts[argument];
					if (this.scripts[argument].failed)
						this.errors.push(this.scripts[argument].src);
					else
						this.successes.push(this.scripts[argument].src);
					this.completed++;
				} else {
					this.scripts[argument] = (Unit.scripts[argument] = Unit.scripts[argument] || new Script(argument))
						.onDone(function(script) {
							this.successes.push(script);
							this.completed++;
							this.checkComplete();
						}.bind(this))
						.onFail(function(error) {
							this.errors.push(error);
							this.completed++;
							this.checkComplete();
						}.bind(this));
				}
				
			}
			return this;
		},
		require: function(arguments) {
			this.required = true;
			this.load(arguments);
		},
		onFail: function(arguments) {
			for (var i in arguments) { var argument = arguments[i];
				if (typeof argument != 'function') throw new Error('Arguments of Unit.fail() must be functions.');
				this.on.fail.push(argument);
			}
			return this.checkComplete();
		},
		onDone: function(arguments) {
			for (var i in arguments) { var argument = arguments[i];
				if (typeof argument != 'function') throw new Error('Arguments of Unit.done() must be functions.');
				this.on.done.push(argument);
			}
			return this.checkComplete();
		},
		checkComplete: function() {
			if (this.completed == this.total) {
				if (this.required && this.errors.length)
					throw new Error('Unable to load the following required scripts: '+this.errors.join(', '));
				else {
					this.loaded = true;
					var _on = this.on;
					if (!this.doneComplete && this.successes.length && _on.done.length) {
						for (var i in _on.done) _on.done[i](this.successes);
						this.doneComplete = true;
					}
					if (!this.failComplete && this.errors.length && _on.fail.length) {
						for (var i in _on.fail) _on.fail[i](this.errors);
						this.failComplete = true;
					}
					console.log('loaded', this.scripts);
				}
			}
			return this;
		}
	}
	function Script(src) {
		Unit.loaded[this.src] = this.loaded = false;
		this.completed = false;
		this.succeeded = false;
		this.failed    = false;
		this.error     = false;
		this.src       = src;
		this.on = {
			load: [],
			done: [],
			fail: []
		}
		var _elem = this.elem = document.createElement('script');
			_elem.setAttribute('async', '');
			_elem.callback = this;
			_elem.type     = 'text/javascript';
			_elem.onload   = this.load.bind(this);
			_elem.onerror  = this.fail.bind(this);
			_elem.src      = src;
		document.getElementsByTagName('head')[0].appendChild(_elem);
	}
	Script.prototype = {
		onLoad: function(callback) {
			this.on.load.push(callback);
			return this;
		},
		onDone: function(callback) {
			this.on.done.push(callback);
			return this;
		},
		onFail: function(callback) {
			this.on.fail.push(callback);
			return this;
		},
		load: function() {
			Unit.loaded[this.src] = this.loaded = true;
			var _on = this.on;
			for (var i in _on.load) _on.load[i]();
			return this;
		},
		done: function() {
			Unit.completed[this.src] = this.succeeded = this.completed = true;
			var _on = this.on;
			for (var i in _on.done) _on.done[i](this.src);
			return this;
		},
		fail: function() {
			Unit.failed[this.src] = this.failed = this.completed = true;
			this.error = true;
			var _on = this.on;
			for (var i in _on.fail) _on.fail[i](this.src);
			return this;
		}
	}
	function getCurrentScriptName() {
	    var error = new Error();
	    var stack = error.stack.split('Object.Unit.finish'),
	    	script;
	    stack = stack[1].split("at ");
	    if (stack[1]) {
	    	if (stack[1].indexOf('(') == -1) {
	    		stack = stack[1].split('/');
	    		script = stack[stack.length-1].split(':')[0];
	    	} else {
    			stack = stack[1].split('(')[1].split(')')[0].split('/');
    			script = stack[stack.length-1].split(':')[0];
	    	}
	    }
	    return script;
	}
	/* -- RETURN -- */
	return Unit;
})(window, document, undefined);

/*

USAGE
-----

Unit
	.path('/units/')
		.load('Class','Node.fragment')
			.then('Service','Node.append')
			.fail(function(errors) {
				console.log('errors', errors);
			})
			.done(function(scripts) {
				console.log('loaded', scripts);
			})
			.then('Service.Worker')
			.then('Widget')
			.done(function(scripts) {
				console.log('loaded', scripts);
			})
		.load('jQuery')
			.done(function(scripts) {
				console.log('loaded', scripts);
			});

*/