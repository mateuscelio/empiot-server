import { Chart, registerables } from 'chart.js';
import ZoomPlugin from 'chartjs-plugin-zoom';

Chart.register(...registerables, ZoomPlugin);

export class App {
  constructor(chartCanvasCtx) {
    this._chartCanvasCtx = chartCanvasCtx;
    this._measurements = [];
    this._startTime = null;
    this._chart = null;

    this.resetMeasurements();
  }

  updateMeasurementData(data) {
    this._measurements = [...this._measurements, ...data];
    if (!this._startTime) this._startTime = data[0].t;

    this._updateChart(data);
  }

  resetMeasurements() {
    this._measurements = [];
    this._startTime = null;
    this._createChart();
  }

  resetZoom() {
    if (this._chart) this._chart.resetZoom();
  }

  _updateChart(data) {
    this._chart.data.datasets[0].data.push(...data.map(d => {
      return {
        x: (d.t - this._startTime),
        y: d.current
      }
    }))
    this._chart.data.datasets[1].data.push(...data.map(d => {
      return {
        x: (d.t - this._startTime),
        y: d.bus_v
      }
    }))
    this._chart.data.datasets[2].data.push(...data.map(d => {
      return {
        x: (d.t - this._startTime),
        y: d.bus_v * d.current
      }
    }))
    this._chart.update('none')
  }

  _createChart() {
    const chartData = {
      datasets: [{
        label: 'Current(mA)',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [],
        radius: 0,
        borderWidth: 1,
        indexAxis: 'x'

      },
      {
        label: 'Bus Voltage(V)',
        backgroundColor: 'rgb(132, 99, 255)',
        borderColor: 'rgb(132, 99, 255)',
        data: [],
        radius: 0,
        borderWidth: 1,
        indexAxis: 'x'
      }
        ,
      {
        label: 'Power(mW)',
        backgroundColor: 'rgb(132, 255, 99)',
        borderColor: 'rgb(132, 255, 99)',
        data: [],
        radius: 0,
        borderWidth: 1,
        indexAxis: 'x'
      }
      ]
    };

    const config = {
      type: 'line',
      data: chartData,
      options: {

        animation: false,
        maintainAspectRatio: false,
        parsing: false,
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: 'xy',
              overScaleMode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy',
            }
          },

        },
        scales: {
          x: {
            type: 'linear',
          },
          y: {
            type: 'linear',
            min: 0,
          }
        },

      }
    };

    if (this._chart) this._chart.destroy();

    this._chart = new Chart(
      this._chartCanvasCtx,
      config
    );
  }
}
