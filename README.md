Unit.js
=======

A script loader for javascript modules. Uses promise-like syntax for enqueueing large dependancy chains. Can handle dependencies included within another dependency.

Simple Case
----
<pre>
Unit
	.load('Widget')
	.then
		.load('Widget.Calender')
		.done(onLoad);
</pre>

Advanced Case
----
<pre>
Unit
	.path('/units/')
		.load('Class','Node.fragment')
			.then
				.load('Service','Node.append')
				.fail(function(scripts) {
					console.log('errors', scripts);
				})
				.done(function(scripts) {
					console.log('loaded', scripts);
				})
				.then
					.require('Service.Worker')
					.then
						.load('Widget')
						.done(function(scripts) {
							console.log('loaded', scripts);
						})
		.load('jQuery').or('http://code.google.com/jQuery')
			.done(function(scripts) {
				console.log('loaded', scripts);
			});
</pre>