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


  var onExecError = function(error) {
    grunt.log.error('Make sure that vlt script is available. And directory path '
      + options.vaultWork+'  exist.');
  };

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
        'cmd': ['ci -N']
      }, ];

    // We read every stream object coming from chilld process
    // and push the proper command for that instruction outputed from that stream.
    var collectData = function(buffer) {

      var data = buffer.toString();
      // Array with files captured from data buffer. We keep its vlt status for each file.
      var filesData = data.replace(/[(].+[)]/g,'').replace(/(\n)/g,';').split(';');

      console.log(data);
      // For each file we have to detect what filter apply
      filesData.forEach(function(fData) {

        // For all filters (yes all)
        statusFilter.forEach(function(sf) {

          if (fData.match(sf.filter)) {

            // Remove the VLT status from string.
            var file = fData.replace(sf.filter,'').trim();

            // Check if the file is not being filtered by task options
            var isValid = ((file.length) && grunt.file.isMatch({ cwd: options.vaultWork }, options.src, file));

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

    var status = exec('vlt st',{ cwd: options.vaultWork }, function(error,stdout,stderr) {
      if (!error) {
        collectData(stdout);
      } else {
        onExecError(error);
      }
      callback(commandList)
    });
  };


  var buildCheckoutCommand = function(options, callback) {

    var opts = options.checkout;

    var credentials = (opts.host.user.length) ? ('--credentials ' + opts.host.user + ':' + opts.host.pwd) : '';

    var buildParams = function(cbParams) {

      var params = (typeof opts.params === 'string') ? opts.params : '';

      if (opts.autoforce) {

          exec('vlt st', { cwd: options.vaultWork },function(error,stdo,stde) {
            if (/is not under vault control/g.test(stdo)) {
              cbParams(params + ' --force');
            } else {
              cbParams(params);
            }
          });
      } else {
        cbParams(params);
      };
    };

    buildParams(function(params) {

      var command = ['vlt', credentials, 'co', params, opts.host.uri, '.'].join(' ');

      // stdout can be true, false or a filepath to log.
      if ((typeof opts.stdout === 'string') && (opts.stdout.length)) {
          command += ' > ' + opts.stdout;
      } else {
        if (opts.stdout === false)
          command += ' > /dev/null';
      };

      callback(command);
    });
  }



  exports.checkout = function(callback) {

    buildCheckoutCommand(options, function(command) {

      grunt.log.writeln(command);
      grunt.log.writeln('Please wait...');
      var coProcess = exec(command, {maxBuffers: 200*2048, cwd: options.vaultWork},function(error,stdo,stde) {
        if (options.checkout.stdout !== false) {
          console.log(stdo);
        }
        if (!error) {
          callback(0);
        } else {
          console.log(stde);
          onExecError(error);
          callback(1)
        }
      });
    })
  };


  exports.autorun = function(callback) {

    var error = false;
    var maxAttemps = 4;

    var each = (options.multithread) ? async.each : async.eachSeries;

    // Checks for some available vlt operations and execute them.
    var processAll = function() {
      grunt.log.writeln('Getting information...');

      // Callback returns the tasklist what contains the things that we should run
      // to keep up to date our work directory.
      whatsNext(function(taskList) {

        // Executes vlt's commit (but sub-commands per file will run in serie)
        each(taskList, function(task, nextTask) {

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

          }, nextTask);
        }, function(){

            if (taskList.length && --maxAttemps) {
              processAll()
            } else {
              error = maxAttemps === 0
              callback(error);
            }

        });
      });// whatsNext
    };// processAll

    processAll();
  };

  return exports;
}
