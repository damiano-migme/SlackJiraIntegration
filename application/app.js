var restify = require('restify');

var configFile = process.argv[2] ? process.argv[2] : './secret.config.json';
console.log('Config file: ' + configFile);
var logError = console.error;
console.error = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('-');
    args.unshift(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
    logError.apply(this, args);
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('nconf').use('file', { file: configFile }).argv();

var port = 3000,
    jira = require('./controllers/JiraCtrl'),
    server = restify.createServer({
        name: 'SlackIntegration API'
    });


server.use(restify.gzipResponse());
server.use(restify.queryParser());
server.use(restify.bodyParser({
    maxBodySize: 0
}));

server.on('uncaughtException', function (req, res, route, error) {
    /* jshint -W109 */
    console.error(error.toString());
    res.json(error.statusCode, {
        msg: error.message,
        stack: error.stack
    });
});

var respond = function(req, res, next) {
    res.send(200, {
        hello: 'world'
    });
    next();
};

server.get('/', respond);
server.post('/api/jira', jira.receiveEvent);

server.listen(port);
console.log('Starting Restify on port: ' + port);