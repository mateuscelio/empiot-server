import io from 'socket.io-client';
import { App } from './app';

const socket = io();

const startBtn = document.getElementById('start-btn')
const stopBtn = document.getElementById('stop-btn')
const restartBtn = document.getElementById('restart-btn')
const resetChartZoomBtn = document.getElementById('reset-zoom')
const chartCanvasCtx = document.getElementById('chart')
const exportDataBtn = document.getElementById('export-data-btn')

const app = new App(chartCanvasCtx);

startBtn.addEventListener('click', () => startMeasurement())
stopBtn.addEventListener('click', () => stopMeasurement())
restartBtn.addEventListener('click', () => restartEmpiotProccess())
resetChartZoomBtn.addEventListener('click', () => resetChartZoom())
exportDataBtn.addEventListener('click', () => exportData())

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

function restartEmpiotProccess() {
  socket.emit('empiotCommand', 'restartEmpiotProccess')
}

function resetChartZoom() {
  app.resetZoom();
}

function exportData() {
  const fileName = prompt('Name of measurements export file') || 'measurements'

  let csvContent = "data:text/csv;charset=utf-8,id;t;current;busVoltage;power\n"
    + app.getMeasurements().map(e => Object.values(e).join(";")).join("\n");
  let encodedUri = encodeURI(csvContent)

  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);

  link.click();
}

