const { spawn } = require('child_process');
const { showStd } = require('../utils');
const dgram = require('node:dgram');

const EMPIOT_MEASUREMENT_CONTROL_PORT = 5000;
const EMPIOT_BIN = '/home/pi/empiot/source/empiot';

let empiotProc = null;
const udpSocket = dgram.createSocket('udp4');

exports.startEmpiotProc = () => {
  if (!empiotProc) {
    empiotProc = spawn(EMPIOT_BIN, ['/tmp/readings', '-g'])

    empiotProc.on('exit', function (code, signal) {
      console.log('Empiot process exited with ' +
        `code ${code} and signal ${signal}`);
      empiotProc = null
    });
    empiotProc.stdout.on('data', (data) => showStd('Empiot Proc Stdout', data))
    empiotProc.stderr.on('data', (data) => showStd('Empiot Proc Stdout', data))

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
  if (empiotProc)
    empiotProc.stdin.write('q\n´');
}

exports.startMeasurement = () => {
  udpSocket.send('start\n', EMPIOT_MEASUREMENT_CONTROL_PORT)
}

exports.stopMeasurement = () => {
  udpSocket.send('stop\n', EMPIOT_MEASUREMENT_CONTROL_PORT)
}
