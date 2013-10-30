'use strict';

var assert = require('assert');
require('should');

var BUILD_ID = 10380000;

module.exports = [
    {
        uri: '/builds/',
        verb: 'GET',
        tests: function () {
            console.warn('/builds/ - TOO INEFFICIENT FOR USE');
        }
    },
    {
        uri: '/builds/:id',
        verb: 'GET',
        tests: function () {
            it('/builds/:id', function (done) {
                this.publicTravis.builds({
                    id: BUILD_ID
                }, function (err, res) {
                    if (err) { return done(new Error(err)); }

                    assert(res.hasOwnProperty('build'));
                    assert(res.build.id === BUILD_ID);

                    done();
                });
            });
        }
    },
    {
        uri: '/builds/:id/cancel',
        verb: 'POST',
        tests: function () {
            it('/builds/:id/cancel', function (done) {
                // trigger a build
                this.privateTravis.requests({
                    build_id: BUILD_ID
                }, function (err, res) {
                    if (err) { return done(new Error(err)); }

                    assert(res.hasOwnProperty('result'));
                    assert(res.hasOwnProperty('flash'));
                    assert(res.result === true);

                    // verify that the build was successfully triggered
                    this.privateTravis.builds({
                        id: BUILD_ID
                    }, function (err, res) {
                        if (err) { return done(new Error(err)); }

                        assert(res.build.id === BUILD_ID);
                        assert(res.build.state === 'created');

                        // cancel the build
                        this.privateTravis.builds.cancel({
                            id: BUILD_ID
                        }, function (err) {
                            if (err) { return done(new Error(err)); }

                            // verify that the build was succesfully canceled
                            this.privateTravis.builds({
                                id: BUILD_ID
                            }, function (err, res) {
                                if (err) { return done(new Error(err)); }
                                
                                assert(res.build.id === BUILD_ID);
                                assert(res.build.state === 'canceled');

                                done();
                            });
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            });
        }
    }
];