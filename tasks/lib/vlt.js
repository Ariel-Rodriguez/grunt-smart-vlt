/*
 * grunt-smart-vlt
 * https://github.com/Ariel-Rodriguez/grunt-smart-vlt
 *
 * Copyright (c) 2014 Ariel Fernando Delfor Rodriguez
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt, options, scope) {

  var spawn = require('child_process').spawn;
  var exec  = require('child_process').exec;
  var async = require('async');

  /*
    Returns a callback with a list of possible task to do with vlt.
  */
  var whatsNext = function(callback) {
    var commandList = [];

    // statusFilter - Hashmap to recognize and register what command must we run related to vlt status output.
    // Reference: http://dev.day.com/docs/en/cq/current/core/how_to/how_to_use_the_vlttool.html#Sync
    var statusFilter = [{
        'filter': new RegExp('(^[!]\\s)','gm'),
        'cmd': ['del','ci -N']
      }, {
        'filter': new RegExp('(^[?]\\s)','gm'),
        'cmd': ['add -N','ci -N']
      }, {
        'filter': new RegExp('(^[M]\\s)','gm'),
        'cmd': ['ci -N']
      }, {
        'filter': new RegExp('(^[A]\\s)|(^[D]\\s)','gm'),
        'cmd': ['up -N','ci -N']
      }, ];

    // We read every stream object coming from chilld process
    // and push the proper command for that instruction outputed from that stream.
    var collectData = function(buffer) {

      var data = buffer.toString();

      // Array with files captured from data buffer. We keep its vlt status for each file.
      var filesData = data.replace(/[(].+[)]/g,'').split(/(\n)/g);

      // For each file we have to detect what filter apply
      filesData.forEach(function(fData) {

        // For all filters (yes all)
        statusFilter.forEach(function(sf) {

          if (fData.match(sf.filter)) {

            // Remove the VLT status from string.
            var file = fData.replace(sf.filter,'').trim();
            // Check if the file is not being filtered by task options
            var isValid = grunt.file.isMatch({ cwd: options.vaultWork }, options.src, file);

            if (isValid) {
              commandList.push({
                'cmd': sf.cmd,
                'file': file
              });
            }
          }
        });
      });
    };

    process.nextTick(function() {
      status.stdout.on('data', collectData);
      status.stderr.on('data', collectData);
      status.on('close', function(){ callback(commandList) });
      status.on('error', function(data) {
        grunt.log.error('Make sure that vlt script is available. And directory path '
          + options.vaultWork+'  exist.'); })
    });

    var status = exec('vlt st',{ cwd: options.vaultWork }, function(err,stdout,stderr) {});
  };


  exports.checkout = function(onError, onFinish) {

    var opts = options.checkout;

    var credentials = (opts.host.user.length) ? (' --credentials ' + opts.host.user + ':' + opts.host.pwd) : '';

    var params = (typeof opts.params === 'string') ? opts.params : '';

    var command = 'vlt' + credentials + ' co ' + params + opts.host.uri + ' ' + options.vaultWork;

    // stdout can be true, false or a filepath to log.
    if ((typeof options.stdout === 'string') && (options.stdout.length)) {
        command += ' > ' + options.stdout;
    } else {
      if (options.stdout === !1)
        command += ' > /dev/null';
    }

    exec(command, {maxBuffers: 200*2048, cwd: options.vaultWork},
      function(error, stdout, stderr) {
        if (stderr.length || error > 0) {
          if (onError instanceof Function) {
            onError(stderr);
          }
        }
        if (onFinish instanceof Function) {
          onFinish(stdout);
        }
    });
  };


  exports.autorun = function(callback) {

    var error = false;
    var maxAttemps = 4;
    // Checks for some available vlt operations and execute them.
    var processAll = function() {

      // Callback returns the tasklist what contains the things that we should run
      // to keep up to date our work directory.
      whatsNext(function(taskList) {

        // Executes each vlt's commit at once (sub-commands per file must run in serie)
        async.each(taskList, function(task, taskFinish) {

          // Executes each vlt sub-command in order.
          async.eachSeries(task.cmd, function(arg, nextCommand) {

            // TODO: make these arguments optional
            var command = 'vlt ' + arg + ' --force ' + task.file;

            grunt.log.writeln(options.vaultWork + '$ ' + command);

            var proc = exec(command, { cwd: options.vaultWork }, function(err,stdout,stderr) {
              if (options.stdout) {
                grunt.log.writeln(stdout);
                if (stderr.length) grunt.log.error(stderr);
              }
              nextCommand();
            });

          }, taskFinish);

        }, function() {
            if (taskList.length && --maxAttemps) {
              processAll()
            } else {
              error = maxAttemps === 0
              callback(error);
            }
        });// each
      });// whatsNext
    };// processAll

    processAll();
  };

  return exports;
}
