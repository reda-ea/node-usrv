
var _ = require('lodash');

var Client = function() {
    this.services = [];
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

Client.prototype.handle = function(message, callback, localOnly) {
    var service = _.find(_.shuffle(this.services), function(s) {
        return s.check(message);
    });
    if(service)
        return service.method(message, callback);
    if(!localOnly && this.network)
        return this.network.handle(message, callback);
    callback({
        code: 'NOSERVICE',
        message: 'No service is able to handle this message'
    }, null);
};

module.exports = Client;
