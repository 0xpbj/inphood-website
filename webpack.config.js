var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/index'
  ],
  externals: {
    'Config': JSON.stringify({
      instagram : '7ca65e72ec6f4763aae5ad5e3779a1f8',
      redirect_uri:'http://127.0.0.1:3000/',
      // redirect_uri:'http://www.inphood.com/',
      FIREBASE_API_KEY:'AIzaSyBmW9xYOdOWcasrKN102p9RCoWhG97hMeY',
      FIREBASE_AUTH_DOMAIN:'inphooddb-e0dfd.firebaseio.com',
      FIREBASE_DATABASE_URL:'https://inphooddb-e0dfd.firebaseio.com',
      FIREBASE_STORAGE_BUCKET:'inphooddb-e0dfd.appspot.com'
    })
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
      loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js']
  },
  // target: 'node',
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
