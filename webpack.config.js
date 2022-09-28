const path = require('path')

module.exports = {
  entry: './src/public/index.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist', 'public'),
  },
  devServer: {
    static: './dist/public',
    client: {
      overlay: false
    }
  },
}
