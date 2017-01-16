const path = require('path');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const S3Plugin = require('webpack-s3-plugin');

const config = require('./config/main');

module.exports = function (env) {
  const webpackConfig = {
    entry: {
      app: [
        './client/client.jsx',
      ],
      vendor: [
        'babel-polyfill',
        'react',
        'react-dom',
      ],
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'public/[name].[chunkhash].js',
      publicPath: config.cdn,
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
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader',
          }),
        },
        { test: /\.gql(\?.*)?$/, loader: 'raw-loader' },
        { test: /\.(jpg|png|gif)$/, loader: 'file-loader?name=public/img/[hash].[ext]' },
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.less$/, loader: "style-loader!css-loader!less-loader"},
        {
          test: /\.(eot|ttf|woff|woff2|svg)$/,
          loader: 'file-loader?name=public/fonts/[name].[ext]',
        },
        {
          test: /\.jsx?$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
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
      new CleanWebpackPlugin(['build']),
      new webpack.ProvidePlugin({
        React: 'react',
        ReactDOM: 'react-dom',
      }),
      new webpack.DefinePlugin({
        isBrowser: JSON.stringify(false),
        __env: JSON.stringify(),
        'process.env': {
          // This has effect on the react lib size
          NODE_ENV: JSON.stringify('production'),
        },
      }),
      new ExtractTextPlugin('public/bundle.[contenthash].css'),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: 'public/vendor.[chunkhash].js',
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
      new ManifestPlugin(),
    ],
    externals: {
      'Config': JSON.stringify({
        instagram : '7ca65e72ec6f4763aae5ad5e3779a1f8',
        redirect_uri:'http://www.inphood.com/',
        FIREBASE_API_KEY:'AIzaSyBmW9xYOdOWcasrKN102p9RCoWhG97hMeY',
        FIREBASE_AUTH_DOMAIN:'inphooddb-e0dfd.firebaseio.com',
        FIREBASE_DATABASE_URL:'https://inphooddb-e0dfd.firebaseio.com',
        FIREBASE_STORAGE_BUCKET:'inphooddb-e0dfd.appspot.com',
        AWS_ACCESS_ID: 'AKIAI25XHNISG4KDDM3Q',
        AWS_SECRET_KEY: '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'
      }),
      'react': 'React',
      'react-dom': 'ReactDOM',
      'aws-sdk': 'AWS',
      'react-redux': 'ReactRedux'
    },
    devtool: 'source-map',
    stats: {
      children: false,
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false,
    },
    node: {
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
  };

  if (!env.noDeploy) {
    webpackConfig.plugins.push(new S3Plugin({
      directory: 'build',
      s3Options: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
        region: env.region,
      },
      s3UploadOptions: {
        Bucket: env.bucket,
      },
      cacheOptions: {
        cacheControl: 'max-age=315360000, no-transform, public',
      },
    }));
  }

  return webpackConfig;
};
