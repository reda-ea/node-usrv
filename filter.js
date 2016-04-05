
var _ = require('lodash');

var Filter = function(type, data) {
    this.type = type;
    this.data = data;
};

Filter.prototype.check = function(message) {
    if(!Filter.types[this.type])
        return false;
    return Filter.types[this.type](this.data, message)
};

Filter.types = {
    object: function(data, message) {
        return _.isMatch(message, data);
    }
};

module.exports = Filter;

