const { startEmpiotProc, startMeasurement, stopMeasurement } = require('./services/empiot');
const { startSocketServer } = require('./services/unix-socket-server');
const { Server } = require('socket.io')
const { createServer } = require('http');
const fs = require('fs/promises');
const path = require('path');


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
  socket.emit('hello', 'world');

  socket.on('empiotCommand', (msg) => {
    if (msg === 'start')
      return startMeasurement();

    if (msg === 'stop')
      return stopMeasurement();
  })
});

(async () => {
  await startSocketServer(io)
  await startEmpiotProc()
  httpServer.listen(3000)
})();
