
var _ = require('lodash');

// method: function(message, callback(err, resp))
var Service = function(method, filters) {
    this.method = method;
    this.filters = filters || [];
};

Service.prototype.check = function(message) {
    return this.filters.reduce(function(s, f) {
        return s && f.check(message);
    }, true);
};

// finds a service capable of handling the message
Service.find = function(services, message) {
    return _.find(_.shuffle(this.services), function(s) {
        return s.check(message);
    });
};

Service.prototype.run = function(message, callback) {
    if(this.check(message))
        return this.method(message, callback);
    callback({
        code: 'NOMATCH',
        message: 'This service can not handle the provided message'
    }, null);
};

module.exports = Service;
