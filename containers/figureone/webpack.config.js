const path = require('path');
/* eslint-disable camelcase */
// eslint-disable-next-line import/no-unresolved
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// eslint-disable-next-line import/no-unresolved
// const TerserPlugin = require("terser-webpack-plugin");
// eslint-disable-next-line import/no-unresolved
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies
const TerserPlugin = require('terser-webpack-plugin');

const buildPath = path.resolve(__dirname, 'package');

/*
Notes on worker:

For dev, a separate worker file figureone.worker.js is loaded from the package
folder. This only works when served from a HTTP server.

For prod, the worker file is a blob inline in figureone.min.js. This does not
work for dev, as when in dev it is also looking for a map file, whose path does
not seem to be easily set up (at least for me) in the package folder.
*/
const envConfig = {
  prod: {
    name: 'production',
    shortName: 'prod',
    uglify: true,
    webpackMode: 'production',
    devtool: false,
    uglifySourceMap: false,
    output: 'figureone.min.js',
    workerPath: '/static/workers/',
    workerName: 'figureone.worker.js',
    workerInline: 'fallback',
  },
  dev: {
    name: 'development',
    shortName: 'dev',
    uglify: false,
    webpackMode: 'development',
    devtool: 'source-map',
    uglifySourceMap: false,
    output: 'index.js',
    workerPath: '/package/',
    workerName: 'figureone.worker.js',
    workerInline: undefined,
  },
};

module.exports = (env) => {
  // setup environmnet mode for dev, stage or prod
  let e = envConfig.dev;
  if (env !== undefined) {
    if (env.mode === 'prod') {
      e = envConfig.prod;
    }
    if (env.mode === 'dev') {
      e = envConfig.dev;
    }
  }

  console.log(`Building for ${e.name}`); // eslint-disable-line no-console

  // let uglify = '';

  // if (e.uglify) {
  //   uglify = new UglifyJsPlugin({
  //     uglifyOptions: {
  //       ecma: 8,
  //       warnings: false,
  //       // parse: { ...options },
  //       // compress: { ...options },
  //       // mangle: {
  //       //   ...options,
  //       //   properties: {
  //       //     // mangle property options
  //       //   },
  //       // },
  //       output: {
  //         comments: false,
  //         beautify: false,
  //         // ...options
  //       },
  //       compress: {
  //         passes: 3,
  //       },
  //       toplevel: false,
  //       nameCache: null,
  //       ie8: false,
  //       keep_classnames: undefined,
  //       keep_fnames: false,
  //       safari10: false,
  //     },
  //     sourceMap: e.uglifySourceMap,
  //   });
  // }

  let toClean = true;
  let clean = '';
  if (env !== undefined && env.clean !== undefined && env.clean === 0) {
    toClean = false;
  }
  if (toClean) {
    clean = new CleanWebpackPlugin();
  }

  // Make the plugin array filtering out those plugins that are null
  const pluginArray = [
    // uglify,
    clean].filter(elem => elem !== '');

  let externals = {};
  if (e.shortName === 'prod' || e.shortName === 'stage') {
    externals = {
      react: 'React',
      'react-dom': 'ReactDOM',
    };
  }

  return {
    entry: './src/index.js',
    output: {
      path: buildPath,
      filename: e.output,
      library: 'Fig',
      libraryExport: 'default',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    externals,
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          // minify: TerserPlugin.uglifyJsMinify,
          terserOptions: {
            compress: true,
            // output: {
            //   ascii_only: true,
            // },
            format: {
              // comments: false,
              ascii_only: true,
            },
          },
          extractComments: false,
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [
            /(node_modules)/,
            /\.worker\.js$/,
          ],
          use: 'babel-loader',
        },
        {
          test: /\.worker\.js$/,
          use: [
            {
              loader: 'worker-loader',
              options: {
                inline: e.workerInline,
                publicPath: e.workerPath,
                filename: e.workerName,
                // filename: '[contenthash].worker.js',
              },
            },
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              },
            },
          ],
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              // options: {
              //   name: '[path][hash].[ext]'
              // }
              options: {
                name(file) {
                  let newPath = file.replace('/opt/app/src/', '');
                  newPath = newPath.replace(/\/[^/]*$/, '');
                  return `${newPath}/[name].[ext]`;
                },
              },
            },
          ],
        },
      ],
    },
    plugins: pluginArray,
    mode: e.webpackMode,
    devtool: e.devtool,
    // optimization: {},
  };
};
