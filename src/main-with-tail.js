const { spawn } = require( 'child_process');
const {appendFile} = require('fs/promises')
const {showStd} = require('util')

let lineCout = 0

const tailChild = spawn('tail', ['-f', '/tmp/readings'])
const empiotChild = spawn('/home/pi/tcc/empiot-original/empiot/source/empiot', [ '/tmp/readings', '-t', '5'])




tailChild.on('exit', function (code, signal) {
  console.log('tailChild process exited with ' +
              `code ${code} and signal ${signal}`);
});

empiotChild.on('exit', function (code, signal) {
  console.log('Empiot process exited with ' +
              `code ${code} and signal ${signal}`);
});


empiotChild.stdout.on('data', (data) => showStd('Empiot Stdout', data))
empiotChild.stderr.on('data', (data) => showStd('Empiot Stderr', data))

let lastLine = ''

tailChild.stdout.on('data', async (data) => {
  showStd('Tail Stdout '+lineCout, data)
    lineCout += 1
    
    const {parsedLines, updatedLastLine} = parseFromTail(data, lastLine )
    lastLine = updatedLastLine
    await appendFile('./out.txt', parsedLines)
})

tailChild.stderr.on('data', (data) => showStd('Tail Stderr', data))

function parseFromTail(data, lastLineContent) {
  const lines = data.toString().split('\n')
  if (lastLineContent !== '') {
    lines[0] = lastLineContent + lines[0]
  } 

  const updatedLastLine = lines.pop()

  return {
   parsedLines:  JSON.stringify({ data: lines}),
    updatedLastLine 
  }
}
