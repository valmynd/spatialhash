var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    'app': './src/hash3d.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'spatialhash.js',
    library: 'spatialhash',
    libraryTarget: 'var',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          plugins: [["transform-runtime", { "polyfill": false, "helpers": false, "regenerator": true }]],
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin({sourceMap: true, mangle: {
      except: ['BoxHash', 'insert', 'findNearestNeighbour', 'findNearestNeighbours', 'cells', 'key']
    }})
  ]
};
