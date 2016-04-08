
var _ = require('lodash');
var peercloud = require('peercloud');

var $service = require('./service');
var $filter = require('./filter');
var $client = require('./client');

var Network = function(services) {
    this.data = {
        services: services.map(function(service) {
            return {
                filters: service.filters.map(function(filter) {
                    return {
                        type: filter.type,
                        data: filter.data
                    };
                })
            };
        })
    };
    this.onrequest = function(req, cb) {
        $client.prototype.handle.call({
            services: services
        }, req, cb);
    };
    this.peers = function() {
        return [];
    };
};

// creates a peercloud network, options.data will be replaced
Network.prototype.connect = function(options, cb) {
    var self = this;
    peercloud(_.assign(_.clone(options || {}), {
        data: self.data,
        onmessage: function(peer, body, reply) {
            if(typeof body.request != 'object')
                return reply({
                    code: 'NOREQUEST',
                    message: 'No request provided - not a service call'
                });
            self.onrequest(body.request, function(err, body) {
                if(err)
                    return reply(err);
                reply(null, {
                    response: body
                });
            });
        }
    }), function(err, client) {
        if(err)
            return cb({
                code: 'NETWORKERROR',
                message: 'Unable to connect to peer cloud',
                cause: err
            });
        self.peers = function() {
            return client.peers();
        };
        self.close = function() {
            return client.close();
        };
        cb(null, self);
    });
};

Network.prototype.services = function() {
    return _.shuffle(this.peers().reduce(function(services, peer) {
        return services.concat(peer.data.services.map(function(service) {
            return _.extend(new $service(function(message, callback) {
                peer.send({
                    request: message
                }, function(err, body) {
                    if(err)
                        return callback(err);
                    if(typeof body.response != 'object')
                        return callback({
                            code: 'NORESPONSE',
                            message: 'No response provided - not a service reply'
                        });
                    callback(null, body.response);
                });
            }), {
                filters: service.filters.map(function(filter) {
                    return new $filter(filter.type, filter.data);
                })
            });
        }));
    }, []));
};

Network.prototype.handle = function(message, callback) {
    $client.prototype.handle.call({
        services: this.services()
    }, message, callback);
};

module.exports = Network;
