const { spawn } = require('child_process');
const { showStd } = require('../utils');
const dgram = require('node:dgram');
const path = require('path');

const EMPIOT_MEASUREMENT_CONTROL_PORT = 5000;
const EMPIOT_BIN = path.join(__dirname, '/../../empiot/dist/empiot');

let empiotProc = null;
const udpSocket = dgram.createSocket('udp4');

exports.startEmpiotProc = (wsServer, config) => {
  const { unixSocketPath, shuntResistor, bufferSize, adcMode } = config
  if (!empiotProc) {
    empiotProc = spawn(EMPIOT_BIN, [shuntResistor, '-s', unixSocketPath, adcMode, bufferSize, '-g']);

    empiotProc.on('exit', function (code, signal) {
      console.log('Empiot process exited with ' +
        `code ${code} and signal ${signal}`);
      //      process.exit(1)
    });
    empiotProc.stdout.on('data', (data) => {
      if (data.includes('FINISHED SAMPLING INTERVAL')) {
        wsServer.emit('finishedSampling', '')
      }
      showStd('Empiot Proc Stdout', data)
    })
    empiotProc.stderr.on('data', (data) => showStd('Empiot Proc Stderr', data))

    return new Promise((resolve, reject) => {
      empiotProc.on('exit', (code, sig) => reject(`${code}:${sig}`))
      empiotProc.stdout.on('data', (data) => {
        if (data.includes('STARTING ENERGY MEASUREMENT')) {
          resolve(true)
        }
      })
    });
  }
}

exports.stopEmpiotProc = () => {
  if (empiotProc) {
    empiotProc.kill('SIGKILL')
    empiotProc = null;
  }
}

exports.startMeasurement = () => {
  udpSocket.send('start\n', EMPIOT_MEASUREMENT_CONTROL_PORT)
}

exports.stopMeasurement = () => {
  udpSocket.send('stop\n', EMPIOT_MEASUREMENT_CONTROL_PORT)
}
