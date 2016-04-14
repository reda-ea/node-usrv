
var _ = require('lodash');

var $filter = require('./filter');
var $service = require('./service');
var $client = require('./client');

module.exports = function() {
    'use strict';

    var self = this;
    if(!self) self = {};

    var client = new $client();

    var _provide = function(service, type, filter) {
        var specs = service;
        if(typeof service == 'function')
            specs = {
                method: service,
                filters: []
            };
            if(type)
                specs.filters.push({
                    type: type,
                    data: filter
                });
        client.services.push(_.extend(new $service(_.bind(specs.method, self)), {
            filters: specs.filters.map(function(f) {
                return new $filter(f.type, f.data);
            })
        }));
        return self;
    };

    var _connect = function(peers, port, callback) {
        if(!_.isArray(peers))
            peers = [peers];
        if(typeof peers[0] != 'object') {
            callback = port;
            port = peers[0];
            peers = [{ip: 'localhost', port: 9338}];
        }
        if(typeof port != 'number') {
            callback = port;
            port = 0;
        }
        if(typeof callback != 'function')
            callback = _.noop;
        client.connect({peers: peers, port: port}, function(err) {
            if(err)
                return callback.call(self, err, null);
            delete self.provide;
            delete self.connect;
            self.send = _send;
            self.disconnect = _disconnect;
            return callback.call(self, null, self);
        });
        return self;
    };

    var _send = function(message, cb) {
        client.handle(message, cb);
        return self;
    };

    var _disconnect = function() {
        client.network.close();
        client.network = null;
        delete self.send;
        delete self.disconnect;
        self.provide = _provide;
        self.connect = _connect;
        return self;
    };

    self.provide = _provide;
    self.connect = _connect;
    return self;
};
