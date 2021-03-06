'use strict'
const os = require('os')
const log = require('debug')
const spawn = require('child_process').spawn

/* Used from both Server and Client */
function spawnProcess (socket) {
  var self = this
  var debug = self.debug
  var debugExec = log('netcat:exec')
  /* spawn exec */
  if (self._exec) {
    debug('Spawning', self._exec)
    var sh = null
    if (self._exec.indexOf('|') !== -1) {
      var cmd = (os.platform() === 'win32') ? 'cmd.exe' : 'sh'
      var cmdO = (os.platform() === 'win32') ? '/C' : '-c'
      debug('multiple commands detected, executing under shell:', cmd, cmdO)
      sh = spawn(cmd, [cmdO, self._exec])
    } else {
      sh = spawn(self._exec, self._execArgs)
    }
    sh.on('exit', function (code, signal) {
      debug(self._exec, 'exit with', code, signal)
    })
    sh.stdin.resume()
    socket.pipe(sh.stdin) // incoming data
    sh.stdout.pipe(socket) // response
    sh.stderr.pipe(socket)

    sh.stdout.on('data', function (d) {
      debugExec('stdout:', d.toString())
    })
    sh.stderr.on('data', function (e) {
      debugExec('stderr:', e.toString())
    })
  }
}

module.exports = {
  spawnProcess: spawnProcess
}
