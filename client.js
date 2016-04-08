
var _ = require('lodash');

var $service = require('./service');

var Client = function(services) {
    this.services = services || [];
    this.network = null;
};

Client.prototype.provide = function(service) {
    if(this.network)
        throw {
            code: 'BADSTATUS',
            message: 'Services can not be registered after the client has connected'
        };
    this.services.push(service);
};

Client.prototype.handle = function(message, callback) {
    var service = $service.find(this.services, message);
    if(service)
        return service.method(message, callback);
    if(this.network)
        return this.network.handle(message, callback);
    callback({
        code: 'NOSERVICE',
        message: 'No service is able to handle this message'
    }, null);
};

// convenience: builds and binds a peer cloud
Client.prototype.connect = function(options, callback) {
    var $network = require('./network');
    this.network = new $network(this.services);
    this.network.connect(options, callback);
};

module.exports = Client;
