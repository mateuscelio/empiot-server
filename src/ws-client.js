const { io } = require('socket.io-client')

const socket = io('ws://localhost:3000')

socket.on('measurementData', (msg) => console.log(msg))
socket.on('connect_error', (err) => {
  console.log(err)
})

socket.emit('empiotCommand', 'start')
setTimeout(() => socket.emit('empiotCommand', 'stop'), 3000);
