import io from 'socket.io-client';
import { App } from './app';

const socket = io();

const startBtn = document.getElementById('start-btn')
const stopBtn = document.getElementById('stop-btn')
const resetChartZoomBtn = document.getElementById('reset-zoom')
const chartCanvasCtx = document.getElementById('chart')

const app = new App(chartCanvasCtx);

startBtn.addEventListener('click', () => startMeasurement())
stopBtn.addEventListener('click', () => stopMeasurement())
resetChartZoomBtn.addEventListener('click', () => resetChartZoom())

socket.on('measurementData', (data) => {
  app.updateMeasurementData(data)
})

function startMeasurement() {
  app.resetMeasurements();
  socket.emit('empiotCommand', 'start');
}

function stopMeasurement() {
  socket.emit('empiotCommand', 'stop');
}

function resetChartZoom() {
  app.resetZoom();
}

