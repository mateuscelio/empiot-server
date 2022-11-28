const net = require('net');
const fs = require('fs/promises');

exports.startSocketServer = async (wsServer, unixSocketPath) => {
  await cleanPreviousSocket(unixSocketPath)

  const unixServer = net.createServer((client) => {
    console.log('connection created!')
    client.on('end', () => {
      console.log('Connection closed')
    })

    client.on('data', (buff) => {
      const msg = buff.toString();
      wsServer.emit('measurementData', parseReadData(msg));
    })
  })

  unixServer.listen(unixSocketPath).on('connection', (s) => {
    console.log('Client connected')
  });

  console.log(`Socket server created on "${unixSocketPath}"`)

}

function parseReadData(readBatch) {
  const lines = readBatch.split('\n').slice(0, -1);
  return lines.map(line => {
    const [id, t_sec, t_nsec, shunt_v, bus_v, current] = line.split('\t')
    return {
      id: parseInt(id),
      t: parseInt(t_sec) + parseFloat(t_nsec) / 1e9,
      t_sec: parseInt(t_sec),
      t_nsec: parseInt(t_nsec),
      shunt_v: parseFloat(shunt_v),
      bus_v: parseFloat(bus_v),
      current: parseFloat(current)
    }
  })
}

async function cleanPreviousSocket(unixSocketPath) {
  try {
    await fs.unlink(unixSocketPath);
    console.log('Removed previous socket file...');
  } catch (error) {
    console.log('No previous socket file found.')
  }
}
