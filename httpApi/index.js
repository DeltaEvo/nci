'use strict';

var Steppy = require('twostep').Steppy,
	_ = require('underscore'),
	http = require('http');

/*
 * Pure rest api on pure nodejs follows below
 */
exports.register = function(app) {
	var config = app.config.httpApi,
		projects = app.projects,
		distributor = app.distributor;

	var server = http.createServer(function(req, res) {
		Steppy(
			function() {
				var stepCallback = this.slot();

				req.setEncoding('utf-8');
				var bodyString = '';
				req.on('data', function(data) {
					bodyString += data;
				});
				req.on('end', function() {
					var body = JSON.parse(bodyString);
					stepCallback(null, body);
				});
				req.on('error', stepCallback);
			},
			function(err, body) {
				res.statusCode = 404;

				// run building of a project
				if (req.url === '/builds' && req.method === 'POST') {
					var projectName = body.project,
						project = _(projects).findWhere({name: projectName});

					if (project) {
						res.statusCode = 204;
						distributor.run({
							projectName: projectName,
							initiator: {type: 'httpApi'}
						}, _.noop);
					}

				}
				res.end();
			},
			function(err) {
				console.log('Error occurred during request: ', err.stack || err);
			}
		);
	});

	server.listen(config.port, config.host);
};