"use strict";
var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var DashboardPlugin = require('webpack-dashboard/plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var WebpackStripLoader = require('strip-loader');
require('whatwg-fetch');

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
loaders.push({ test: /\.js$/, exclude: /node_modules/, loader: 'babel' });
loaders.push({ test: /\.css$/, loader: "style-loader!css-loader" });
loaders.push({ test: /\.less$/, loader: "style-loader!css-loader!less-loader"});
loaders.push({ test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, loader: "url-loader?mimetype=application/font-woff" });
// loaders.push({ test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" });
// loaders.push({ test: /\.js$/, exclude: /(node_modules)/, loader: WebpackStripLoader.loader('debug', 'console.log', 'console.error') });

module.exports = {
	entry: [
    // 'webpack-hot-middleware/client',
    'whatwg-fetch',
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
      facebook: '669941103143805',
      google: '529180412076-r0tlp01nvvavi339qodfo4n6716ohjcg.apps.googleusercontent.com',
      redirect_uri:'http://localhost:3000/',
      FIREBASE_API_KEY:'AIzaSyBmW9xYOdOWcasrKN102p9RCoWhG97hMeY',
      FIREBASE_AUTH_DOMAIN:'inphooddb-e0dfd.firebaseio.com',
      FIREBASE_DATABASE_URL:'https://inphooddb-e0dfd.firebaseio.com',
      FIREBASE_STORAGE_BUCKET:'inphooddb-e0dfd.appspot.com',
      AWS_ACCESS_ID: 'AKIAI25XHNISG4KDDM3Q',
      AWS_SECRET_KEY: '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',
      ELASTIC_LAMBDA_URL: 'https://tah21v2noa.execute-api.us-west-2.amazonaws.com/prod/ingredients',
      SCRAPER_LAMBDA_URL: 'https://3cv8ktguzh.execute-api.us-west-2.amazonaws.com/prod/url',
      CLARIFAI_CLIENT_ID: 'Gk0xpb23IWIY4vRMbHlgQdUxSjlUPBcySEd_gbXN',
      CLARIFAI_CLIENT_SECRET: 'MwkyjpQgC30xwvW6wzext0FyqXle32BcuGX3ZUEe',
      FDA_API_KEY: 'H1ZzD2r8SswyxTBHor63KGLAE4wcBv0UFtSikijz',
      FDA_SEARCH_URL: 'https://api.nal.usda.gov/ndb/search/',
      FDA_REPORT_URL: 'https://api.nal.usda.gov/ndb/V2/reports/',
      DEBUG: true
    }),
    'react': 'React',
    'aws-sdk': 'AWS',
    'firebase': 'firebase',
    'react-dom': 'ReactDOM',
    'react-redux': 'ReactRedux',
    'react-addons-transition-group': {root: ['React','addons','TransitionGroup']},
    'react-addons-css-transition-group': {root: ['React','addons','CSSTransitionGroup']}
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
