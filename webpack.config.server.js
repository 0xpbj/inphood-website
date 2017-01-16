const fs = require('fs');

const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function (env) {
  const webpackConfig = {
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    externals: [nodeExternals()],
    entry: [
      './server/server.jsx',
    ],
    output: {
      path: path.resolve(__dirname, 'build'),
      library: '[name]',
      libraryTarget: 'commonjs2',
      filename: 'server.js',
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
          test: /\.css$/,
          loaders: [
            'isomorphic-style-loader',
            'css-loader?importLoaders=2&sourceMap',
          ],
        },
        {
          test: /\.jsx?$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
        },
        { test: /\.gql(\?.*)?$/, loader: 'raw-loader' },
        { test: /\.less$/, loader: "style-loader!css-loader!less-loader"},
        { test: /\.(jpg|png|gif)$/, loader: 'file-loader?name=public/img/[hash].[ext]' },
        { test: /\.json$/, loader: 'json-loader' },
        {
          test: /\.(eot|ttf|woff|woff2|svg)$/,
          loader: 'file-loader?name=public/fonts/[name].[ext]',
        },
        {
          test: /\.scss/,
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
        isBrowser: JSON.stringify(false),
        'process.env.SERVERLESS': env ? env.serverless : false,
      }),
      new webpack.ProvidePlugin({
        React: 'react',
        ReactDOM: 'react-dom',
      }),
      new CopyWebpackPlugin([
        { from: 'server/lambda.js', to: 'lambda.js' },
        { from: 'server/node_modules', to: 'node_modules' },
      ]),
      // new BundleAnalyzerPlugin(),
    ],
    externals: {
      'Config': JSON.stringify({
        instagram : '7ca65e72ec6f4763aae5ad5e3779a1f8',
        redirect_uri:'http://127.0.0.1:3000/',
        FIREBASE_API_KEY:'AIzaSyBmW9xYOdOWcasrKN102p9RCoWhG97hMeY',
        FIREBASE_AUTH_DOMAIN:'inphooddb-e0dfd.firebaseio.com',
        FIREBASE_DATABASE_URL:'https://inphooddb-e0dfd.firebaseio.com',
        FIREBASE_STORAGE_BUCKET:'inphooddb-e0dfd.appspot.com',
        AWS_ACCESS_ID: 'AKIAI25XHNISG4KDDM3Q',
        AWS_SECRET_KEY: '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'
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
    devtool: 'source-map',
  };

  return webpackConfig;
};
