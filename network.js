
var _ = require('lodash');
var peercloud = require('peercloud');

var $service = require('./service');
var $filter = require('./filter');

var Network = function(client, peers, options, cb) {
    var self = this;
    peercloud(_.assign(_.clone(options || {}), {
        peers: peers,
        data: {
            services: client.services.map(function(service) {
                return {
                    filters: service.filters.map(function(filter) {
                        return {
                            type: filter.type,
                            data: filter.data
                        };
                    })
                };
            })
        },
        onmessage: function(peer, body, reply) {
            client.handle(body, reply, true);
        }
    }), function(err, client) {
        if(err)
            return cb({
                code: 'NETWORKERROR',
                message: 'Unable to connect to peer cloud',
                cause: err
            });
        self.peercloud = client;
        cb(null, client);
    });
};

Network.prototype.services = function() {
    return _.shuffle(this.peercloud.peers().reduce(function(services, peer) {
        return services.concat(peer.data.services.map(function(service) {
            return _.extend(new $service(function(message, callback) {
                peer.send(message, callback);
            }), {
                filters: service.filters.map(function(filter) {
                    return new $filter(filter.type, filter.data);
                })
            });
        }));
    }, []));
};

Network.prototype.handle = function(message, callback) {
    var service = _.find(this.services(), function(s) {
        return s.check(message);
    });
    if(service)
        return service.method(message, callback);
    callback({
        code: 'NORSERVICE',
        message: 'No service on network is able to handle this message'
    }, null);
};

Network.prototype.close = function() {
    this.peercloud.close();
}

module.exports = Network;
