/*
 * grunt-smart-vlt
 * https://github.com/Ariel-Rodriguez/grunt-smart-vlt
 *
 * Copyright (c) 2014 Ariel Fernando Delfor Rodriguez
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Configuration to be run (and then tested).
    svlt: {
      options: {
        vaultWork: '/home/proton/code/cq-kids/ntg-kids-web-view/target/vault-work/jcr_root',
        src: ['**','**/{*.*,.*.xml}', '!**/.vlt*'],
        force: 'auto',
        stdout: true,
        multithread: true,

        checkout: {
          host: {
            uri: 'http://localhost:4502/crx',
            user: false,
            password: false
          },
          force: 'auto',
          params: '--verbose',
          stdout: true
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'svlt', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['svlt']);

};
