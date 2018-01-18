
var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');
var WebpackStripLoader = require('strip-loader');
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
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
      DEBUG: false,
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
    // new BundleAnalyzerPlugin(),
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
