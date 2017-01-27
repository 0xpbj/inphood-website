
var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');
var WebpackStripLoader = require('strip-loader');
require('whatwg-fetch');

loaders.push({
  test: /\.js$/,
  exclude: /(node_modules)/,
  loader: 'babel'
});
// local css modules
loaders.push({
	test: /[\/\\]src[\/\\].*\.css/,
	exclude: /(node_modules|bower_components|public\/)/,
	loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]')
});
// local scss modules
loaders.push({
	test: /[\/\\](node_modules|src)[\/\\].*\.scss/,
	exclude: /(bower_components|public\/)/,
	loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass')
});
// global css files
loaders.push({
	test: /[\/\\](node_modules|global)[\/\\].*\.css$/,
	loader: ExtractTextPlugin.extract('style', 'css')
});
loaders.push({ test: /\.less$/, loader: "style-loader!css-loader!less-loader"});
loaders.push({ test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, loader: "url-loader?mimetype=application/font-woff" });
// loaders.push({ test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" });
loaders.push({ test: /\.js$/, exclude: /(node_modules)/, loader: WebpackStripLoader.loader('debug', 'console.log', 'console.error', 'console.info') });

module.exports = {
	entry: [
    'whatwg-fetch',
		'./src/index.js'
	],
	output: {
		publicPath: '/',
		path: path.join(__dirname, 'public'),
		filename: '[chunkhash].js'
	},
	resolve: {
		extensions: ['', '.js', '.jsx']
	},
	module: {
		loaders
	},
  externals: {
    'Config': JSON.stringify({
      instagram : '7ca65e72ec6f4763aae5ad5e3779a1f8',
      redirect_uri:'https://www.inphood.com/',
      FIREBASE_API_KEY:'AIzaSyBmW9xYOdOWcasrKN102p9RCoWhG97hMeY',
      FIREBASE_AUTH_DOMAIN:'inphooddb-e0dfd.firebaseio.com',
      FIREBASE_DATABASE_URL:'https://inphooddb-e0dfd.firebaseio.com',
      FIREBASE_STORAGE_BUCKET:'inphooddb-e0dfd.appspot.com',
      AWS_ACCESS_ID: 'AKIAI25XHNISG4KDDM3Q',
      AWS_SECRET_KEY: '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',
      LAMBDA_URL: 'https://xmucc9zjlh.execute-api.us-west-2.amazonaws.com/prod/ingredients',
      DEBUG: false,
    }),
    'react': 'React',
    'react-dom': 'ReactDOM',
    'aws-sdk': 'AWS',
    'firebase': 'firebase',
    'react-redux': 'ReactRedux'
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
	plugins: [
		new WebpackCleanupPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				screw_ie8: true,
				drop_console: true,
				drop_debugger: true
			}
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new ExtractTextPlugin('[contenthash].css', {
			allChunks: true
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			title: 'Webpack App'
		}),
		new webpack.optimize.DedupePlugin()
	]
};
