"use strict";
var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var DashboardPlugin = require('webpack-dashboard/plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || "3000";

// local scss modules
loaders.push({
  test: /\.scss$/,
  exclude: /[\/\\](bower_components|public\/)[\/\\]/,
  loaders: [
    'style?sourceMap',
    'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]&sourceMap',
    'postcss',
    'sass'
  ]
});
// // global css
// loaders.push({
//   test: /\.css$/,
//   exclude: /[\/\\]src[\/\\]/,
//   loaders: [
//     'style?sourceMap',
//     'css'
//   ]
// });
// // local css modules
// loaders.push({
//   test: /\.css$/,
//   exclude: /[\/\\](node_modules|bower_components|public\/)[\/\\]/,
//   loaders: [
//     'style?sourceMap',
//     'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]&sourceMap'
//   ]
// });
loaders.push({ test: /\.css$/, loader: "style-loader!css-loader" });

module.exports = {
	entry: [
    // 'webpack-hot-middleware/client',
		'react-hot-loader/patch',
		'./src/index.js' // your app's entry point
	],
	devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
	output: {
		publicPath: '/',
		path: path.join(__dirname, 'public'),
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['', '.js', '.jsx']
	},
	module: {
		loaders
	},
	devServer: {
		contentBase: "./public",
		// do not print bundle build stats
		noInfo: true,
		// enable HMR
		hot: true,
		// embed the webpack-dev-server runtime into the bundle
		inline: true,
		// serve index.html in place of 404 responses to allow HTML5 history
		historyApiFallback: true,
		port: PORT,
		host: HOST
	},
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
    'react': 'React',
    'react-dom': 'ReactDOM',
    'aws-sdk': 'AWS',
    'react-redux': 'ReactRedux'
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
	plugins: [
		new webpack.NoErrorsPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new DashboardPlugin(),
    // new BundleAnalyzerPlugin(),
		new HtmlWebpackPlugin({
			template: './src/index.html'
		}),
	]
};
