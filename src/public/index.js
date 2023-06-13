import io from 'socket.io-client';
import { App } from './app';

const socket = io();
let empiotConfig = {
  shuntResistor: '0.1',
  bufferSize: '500',
  adcMoe: 'adc9b'
}

const startBtn = document.getElementById('start-btn')
const stopBtn = document.getElementById('stop-btn')
const restartBtn = document.getElementById('restart-btn')
const resetChartZoomBtn = document.getElementById('reset-zoom')
const chartCanvasCtx = document.getElementById('chart')
const exportDataBtn = document.getElementById('export-data-btn')
const shuntSelect = document.getElementById('shunt-select');
const adcSelect = document.getElementById('adc-select');
const bufferSelect = document.getElementById('buffer-select');
const totalEnergy = document.getElementById('total-energy');

const app = new App(chartCanvasCtx);

startBtn.addEventListener('click', () => startMeasurement())
stopBtn.addEventListener('click', () => stopMeasurement())
restartBtn.addEventListener('click', () => restartEmpiotProcess())
shuntSelect.addEventListener('change', (e) => updateEmpiotConfig({ shuntResistor: e.target.value }))
adcSelect.addEventListener('change', (e) => updateEmpiotConfig({ adcMode: e.target.value }))
bufferSelect.addEventListener('change', (e) => updateEmpiotConfig({ bufferSize: e.target.value }))
resetChartZoomBtn.addEventListener('click', () => resetChartZoom())
exportDataBtn.addEventListener('click', () => exportData())

socket.on('measurementData', (data) => {
  app.updateMeasurementData(data)
})

socket.on('finishedSampling', (_) => {
  totalEnergy.innerHTML = app.calculateTotalEnergy()
})

function startMeasurement() {
  app.resetMeasurements();
  socket.emit('empiotCommand', 'start');
  totalEnergy.innerHTML = '-'
}

function stopMeasurement() {
  socket.emit('empiotCommand', 'stop');
}

function restartEmpiotProcess() {
  socket.emit('empiotCommand', 'restartEmpiotProcess')
}

function updateEmpiotConfig(updatedValues) {
  empiotConfig = { ...empiotConfig, ...updatedValues }
  socket.emit('updateConfig', empiotConfig)
}

function resetChartZoom() {
  app.resetZoom();
}

function exportData() {
  const fileName = prompt('Name of measurements export file') || 'measurements'

  let csvContent = "data:text/csv;charset=utf-8,id,t,current,busVoltage,power\n"
    + app.getMeasurements().map(e => Object.values(e).join(",")).join("\n");
  let encodedUri = encodeURI(csvContent)

  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);

  link.click();
}
