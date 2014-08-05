/*
 * grunt-smart-vlt
 * https://github.com/Ariel-Rodriguez/grunt-smart-vlt
 *
 * Copyright (c) 2014 Ariel Fernando Delfor Rodriguez
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerTask('svlt', 'Friendly grunt plugin to run Adobe VLT commands.', function(params) {

    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({ vaultWork: 'vault/content/jcr_root'});

    var vlt = require('./lib/vlt')(grunt, options, this);

    if ( this.args[0] === 'co') {

      this.requiresConfig('svlt.checkout.host');

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
