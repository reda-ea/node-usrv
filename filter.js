
var Filter = function(type, data) {
    this.type = type;
    this.data = data;
    if(Filter.types[type])
        this.check = Filter.types[type](data);
};

Filter.prototype.check = function(message) {
    return false;
};

Filter.types = {
};

module.exports = Filter;

