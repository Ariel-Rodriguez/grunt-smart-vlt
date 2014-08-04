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
  var root  = scope;

  /*
    Returns a callback with a list of possible task to do with vlt.
  */
  var whatsNext = function(callback) {
    var commandList = [];

    // sometimes spawn output returns a vlt output in two lines.
    // if datalost was detected, then on next data received try to
    // continue the last job joining the current data.
    var dataLost = '';

    // statusFilter - Hashmap to recognize and register what command must we run related to vlt status output.
    // Reference: http://dev.day.com/docs/en/cq/current/core/how_to/how_to_use_the_vlttool.html#Sync
    var statusFilter = [{
        'filter': new RegExp('(^[!]\\s)','g'),
        'cmd': ['del','ci']
      }, {
        'filter': new RegExp('(^[?]\\s)','g'),
        'cmd': ['add','ci']
      }, {
        'filter': new RegExp('(^[A]\\s)|(^[M]\\s)|(^[D]\\s)','g'),
        'cmd': ['ci']
      }];

    // We read every stream object coming from chilld process
    // and push the proper command for that instruction outputed from that stream.
    var collectData = function(buffer) {

      //  we join dataLost for those cases that when buffer line comes in two reads. (a fragmented buffer)
      var data = dataLost + buffer.toString();

      // Generate the proper command regarding to statusFilter
      statusFilter.forEach(function(sf) {
        if (data.match(sf.filter)) {

          // capture the target file sanitize the current target filepath .
          var file = data.replace(sf.filter,'')
                      // removing return lines
                      .replace(/(\n)$/g,'')
                      // removing "(ext/type)"
                      .replace(/[(].+[)]/g,'');

          // if the target didn't come this time, then we save current data.
          if (file.length < 0) {
            dataLost = data + ' ';
          }
          // If it wasn'ta datalost then always reset its status
          // and push the result command.
          else {
            dataLost = '';
            commandList.push({
              'cmd': sf.cmd,
              'file': file
            });
          }
        };
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

    var status = spawn('vlt',['st'],{ cwd: options.vaultWork });
  };


  exports.checkout = function(onError, onFinish) {
    var command = 'vlt --credentials ' + options.credentials.user + ':' + options.credentials.pwd
              + ' co ' + options.params + ' ' + options.host + ' .';

    if (options.stdout) {
      if (options.stdout.length) {
        command += ' > ' + options.stdout;
      }
    } else {
      command += ' > /dev/null';
    };

    exec(command, {maxBuffers: 200*2048, cwd: options.vaultWork},
      function(error, stdout, stderr) {
        if (stderr.length || error > 0) {
          if (onError instanceof Function) {
            onError(stderr);
          }
        };

        if (onFinish instanceof Function) {
          onFinish(stdout);
        };
    });
  };


  exports.autorun = function(callback) {
    // tasklist contains the things that we might do to keep vlt work directory up to date with the host.
    var toDo = function() {
      whatsNext(function(taskList) {

      // Executes each vlt commit (all tasks at once)
      async.each(taskList, function(task, taskFinish) {

        // Execute each vlt sub-command in order.
        async.eachSeries(task.cmd, function(arg, nextCommand) {

          // TODO: make these arguments optional
          var command = 'vlt ' + arg + ' -N --force ' + task.file;

          console.log('running: '+command+' | From:'+options.vaultWork);

          var proc = exec(command, { cwd: options.vaultWork }, function(err,stdout,stderr) {
            console.log(stdout);
            console.log(stderr);
            nextCommand();
          });

        }, function() {
          taskFinish();
        });
      }, function() {
        if (taskList.length > 0) {
          toDo()
        } else {
          callback(0);
        }
      });// each
    });// whatsNext
    };// toDo

    toDo();
  };

  return exports;
}
