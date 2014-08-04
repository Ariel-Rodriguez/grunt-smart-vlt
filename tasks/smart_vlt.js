/*
 * grunt-smart-vlt
 * https://github.com/Ariel-Rodriguez/grunt-smart-vlt
 *
 * Copyright (c) 2014 Ariel Fernando Delfor Rodriguez
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerTask('smart_vlt', 'Friendly grunt plugin to run Adobe VLT commands.', function(params) {

    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      vaultWork: 'public/content/jcr_root',
      host: 'http://localhost:4502/crx',
      credentials: {
        user: 'admin',
        pwd: 'admin'
      },
      params: '--verbose',
      stdout: true
    });

    var vlt = require('./lib/vlt')(grunt, options, this);

    if (params === 'init') {
      vlt.checkout(
        function(err) {
          done(false);
        },
        function(out) {
          done(true);
        });
    } else {
      vlt.autorun(function(error) {
        done(!error);
      });
    }
  });

};
