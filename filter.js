
var _ = require('lodash');
var ajv = require('ajv')({v5: true});

var Filter = function(type, data) {
    this.type = type;
    this.data = data;
};

Filter.prototype.check = function(message) {
    if(!Filter.types[this.type])
        return false;
    return Filter.types[this.type].call(this, this.data, message);
};

Filter.types = {
    object: function(data, message) {
        return _.isMatch(message, data);
    },
    schema: function(data, message) {
        if(!this._validator)
            this._validator = ajv.compile(data);
        return this._validator(message);
    }
};

module.exports = Filter;

