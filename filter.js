
var Filter = function(type, data) {
    if(Filter.types[type])
        this.check = Filter.types[type](data);
};

Filter.prototype.check = function(message) {
    return false;
};

Filter.types = {
};

module.exports = Filter;

