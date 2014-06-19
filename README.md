Unit.js
=======

A script loader for javascript modules.

<pre>

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
</pre>