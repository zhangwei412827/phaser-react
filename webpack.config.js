var path = require('path');

module.exports = {
  // entry:  {
  //   test: './src/test/index.js'
  // },
  entry:  ["babel-polyfill", "./src/test/index.js"],
  output: {
    filename: 'test.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          // exclude:[path.resolve(__dirname,'node_modules')],
          options: {
            presets: ['@babel/preset-env'],
            // plugins:["@babel/plugin-proposal-class-properties","transform-runtime"]
            plugins:["@babel/plugin-proposal-class-properties"]
          }
        }
      }
    ]
  }
};