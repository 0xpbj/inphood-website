const webpack = require('webpack');
const path = require('path');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: [
    'react-hot-loader/patch',
    'webpack-hot-middleware/client',
    'babel-polyfill',
    './client/client.jsx',
  ],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/static/',
  },
  resolve: {
    alias: {
    },
    modules: [
      'node_modules',
      path.resolve(__dirname, 'client'),
    ],
    extensions: [
      '*',
      '.js',
      '.json',
      '.jsx',
    ],
  },
  module: {
    loaders: [
      {
        enforce: 'pre',
        test: /\.jsx$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
      { test: /\.gql(\?.*)?$/, loader: 'raw-loader' },
      { test: /\.(jpg|png|gif)$/, loader: 'file-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.(eot|ttf|woff|woff2|svg)$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
      { test: /\.less$/, loader: "style-loader!css-loader!less-loader"},
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
      },
      {
      test: /\.scss$/,
      exclude: /[\/\\](public\/)[\/\\]/,
      loaders: [
          'style-loader?sourceMap',
          'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]&sourceMap',
          'postcss-loader',
          'sass-loader'
        ]
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      isBrowser: JSON.stringify(true),
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
    }),
    // new BundleAnalyzerPlugin(),
  ],
  externals: {
    'Config': JSON.stringify({
      instagram : '7ca65e72ec6f4763aae5ad5e3779a1f8',
      redirect_uri:'http://127.0.0.1:8080/',
      FIREBASE_API_KEY:'AIzaSyBmW9xYOdOWcasrKN102p9RCoWhG97hMeY',
      FIREBASE_AUTH_DOMAIN:'inphooddb-e0dfd.firebaseio.com',
      FIREBASE_DATABASE_URL:'https://inphooddb-e0dfd.firebaseio.com',
      FIREBASE_STORAGE_BUCKET:'inphooddb-e0dfd.appspot.com',
      AWS_ACCESS_ID: 'AKIAI25XHNISG4KDDM3Q',
      AWS_SECRET_KEY: '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',
      fastDevelopNutritionPage: false
    }),
    //'react': 'React',
    //'react-dom': 'ReactDOM',
    //'aws-sdk': 'AWS',
    //'react-redux': 'ReactRedux'
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  devtool: 'eval',
};
