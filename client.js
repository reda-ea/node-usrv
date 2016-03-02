
var _ = require('lodash');

var Client = function() {
    this.services = [];
    this.status = 'init';
};

Client.prototype.provide = function(service) {
    if(this.status != 'init')
        throw {
            code: 'BADSTATUS',
            message: 'Services can not be registered after the client has connected'
        };
    this.services.push(service);
};

Client.prototype.handle = function(message, callback) {
    var service = _.find(_.shuffle(this.services), function(s) {
        return s.check(message);
    });
    if(service)
        return service.method(message, callback);
    callback({
        code: 'NOSERVICE',
        message: 'No service is able to handle this message'
    }, null);
};

module.exports = Client;
