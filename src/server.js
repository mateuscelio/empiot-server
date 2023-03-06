const { startEmpiotProc, startMeasurement, stopMeasurement, stopEmpiotProc } = require('./services/empiot');
const { startSocketServer } = require('./services/unix-socket-server');
const { Server } = require('socket.io')
const { createServer } = require('http');
const fs = require('fs/promises');
const path = require('path');

const UNIX_SOCKET_PATH = '/tmp/sock-test'

const httpServer = createServer(async (req, res) => {
  switch (req.url) {
    case '/':
      res.setHeader('Content-Type', 'text/html')
      res.writeHead(200)
      htmlPage = await fs.readFile(path.join(__dirname, '..', 'dist', 'public', 'index.html'))
      res.end(htmlPage);
      break;
    case '/app.js':
      res.setHeader('Content-Type', 'application/javascript')
      res.writeHead(200)
      scriptFile = await fs.readFile(path.join(__dirname, '..', 'dist', 'public', 'app.js'))
      res.end(scriptFile);
      break;
    default:
      res.writeHead(404)
      res.end('Not found!');
      break;
  }
});

const io = new Server(httpServer);

io.use((_socket, next) => {
  console.log('User count ', io.engine.clientsCount);

  if (io.engine.clientsCount > 1)
    return next(new Error('Only one connection is allowed!'))

  next();
})

io.on('connection', (socket) => {
  console.log('WS client connected!');

  socket.on('empiotCommand', async (msg) => {
    if (msg === 'start')
      return startMeasurement();

    if (msg === 'stop')
      return stopMeasurement();

    if (msg === 'restartEmpiotProccess') {
      stopEmpiotProc();
      await startEmpiotProc(io, UNIX_SOCKET_PATH);
    }

    if (msg === 'activeMode') {
      stopEmpiotProc();
      await startEmpiotProc(io, UNIX_SOCKET_PATH, 'active');
    }

    if (msg === 'sleepMode') {
      stopEmpiotProc();
      await startEmpiotProc(io, UNIX_SOCKET_PATH, 'sleep');
    }
  })
});

const startServer = async () => {
  await startSocketServer(io, UNIX_SOCKET_PATH)
  await startEmpiotProc(io, UNIX_SOCKET_PATH)
  httpServer.listen(3000)
}

module.exports = startServer
