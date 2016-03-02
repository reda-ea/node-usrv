
// method: function(message, callback(err, resp))
var Service = function(method) {
    this.method = method;
    this.filters = [];
};

Service.prototype.check = function(message) {
    return this.filters.reduce(function(s, f) {
        return s && f.check(message);
    }, true);
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
