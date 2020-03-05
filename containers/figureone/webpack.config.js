const path = require('path');
// eslint-disable-next-line import/no-unresolved
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// eslint-disable-next-line import/no-unresolved
const CleanWebpackPlugin = require('clean-webpack-plugin');
// eslint-disable-next-line import/no-unresolved
// const webpack = require('webpack');
// eslint-disable-next-line import/no-unresolved
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const Autoprefixer = require('autoprefixer');
// eslint-disable-next-line import/no-unresolved
const CopyWebpackPlugin = require('copy-webpack-plugin');
// eslint-disable-next-line import/no-unresolved
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const buildPath = path.resolve(__dirname, 'package');

const envConfig = {
  prod: {
    name: 'production',
    shortName: 'prod',
    uglify: true,
    webpackMode: 'production',
    // devtool: 'source-map',
    // uglifySourceMap: true,
    devtool: false,
    uglifySourceMap: false,
    output: 'figureone.min.js',
  },
  dev: {
    name: 'development',
    shortName: 'dev',
    uglify: false,
    webpackMode: 'development',
    devtool: 'source-map',
    uglifySourceMap: false,
    output: 'index.js',
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

  let uglify = '';

  if (e.uglify) {
    uglify = new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 8,
        warnings: false,
        // parse: { ...options },
        // compress: { ...options },
        // mangle: {
        //   ...options,
        //   properties: {
        //     // mangle property options
        //   },
        // },
        output: {
          comments: false,
          beautify: false,
          // ...options
        },
        toplevel: false,
        nameCache: null,
        ie8: false,
        keep_classnames: undefined,
        keep_fnames: false,
        safari10: false,
      },
      sourceMap: e.uglifySourceMap,
    });
  }

  let toClean = true;
  let clean = '';
  if (env !== undefined && env.clean !== undefined && env.clean === 0) {
    toClean = false;
  }
  if (toClean) {
    clean = new CleanWebpackPlugin([buildPath]);
  }

  const extract = new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: '[name].css',
    chunkFilename: '[id].css',
  });

  const copy = new CopyWebpackPlugin(
    [
      {
        from: '/opt/app/src/Lessons/*/*/topic.png',
        to: '/opt/app/app/app/static/dist/[1][name].[ext]',
        test: /\/opt\/app\/src\/(.*)topic\.png$/,
      },
    ],
  );

  let cssMini = '';
  if (e.uglify) {
    cssMini = new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      // cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
      canPrint: true,
    });
  }
  // Make the plugin array filtering out those plugins that are null
  const pluginArray = [
    uglify,
    extract,
    copy,
    clean,
    cssMini].filter(elem => elem !== '');

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
      // libraryTarget: 'var',
      libraryExport: 'default',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    externals,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: 'babel-loader',
        },
        {
          test: /\.(css|sass|scss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                sourceMap: envConfig.uglifySourceMap,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [Autoprefixer],
                sourceMap: envConfig.uglifySourceMap,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: envConfig.uglifySourceMap,
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
                  // if (env === 'development') {
                  //   return '[path][name].[ext]'
                  // }
                  let newPath = file.replace('/opt/app/src/', '');
                  // newPath = newPath.replace('/tile.png', '');
                  newPath = newPath.replace(/\/[^/]*$/, '');
                  // console.log(newPath)
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
    optimization: {
      // SplitChunks docs at https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        cacheGroups: {
          default: {
            minChunks: 2000,
            priority: -20,
            reuseExistingChunk: true,
          },
          tools: {
            minSize: 10,
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
            test: /js\/(diagram|Lesson|tools|components)/,
            name: 'tools',
          },
          commoncss: {
            minSize: 10,
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
            test: /css\/*\.(css|scss|sass)$/,
            name: 'commoncss',
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name: 'vendors',
          },
        },
      },
    },
  };
};
