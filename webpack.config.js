const path = require('path');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');
const fs = require('fs-extra');
const WebpackEventPlugin = require('webpack-event-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const browsersync = require('browser-sync');

const module_config = {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules\/(?!twig-components))/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env'],
        }
      }
    },
    {
      test: /\.twig$/,
      use: [
        { loader: 'raw-loader' },
        { loader: 'inline-source-loader' }
      ]
    },
    {
      test: /\.scss$/,
      use: [
        { loader: 'css-loader' },
        { loader: 'sass-loader' }
      ],
    }
  ],
};

module.exports = [
  {
    entry: [
      './node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
      './node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
      './packages/components/bolt.components.js'
    ],
    output: {
      path: path.resolve(process.cwd(), 'www'),
      filename: 'bolt.components.bundled.js'
    },
    devServer: {
      open: false,
      contentBase: [
        path.resolve(process.cwd(), 'www')
      ],
      // compress: true,
      port: 8080,
      overlay: {
        errors: true
      },
      // hot: true,
      inline: false,
      // noInfo: false, 
      publicPath: '/build/',
      // watchContentBase: true,
      watchOptions: {
        aggregateTimeout: 200,
      }
    },
    module: module_config,
    plugins: [
      new MinifyPlugin(),
      new BrowserSyncPlugin(
        // BrowserSync options
        {
          // browse to http://localhost:3000/ during development
          host: 'localhost',
          port: 8080,
          // proxy the Webpack Dev Server endpoint
          // (which should be serving on http://localhost:3100/)
          // through BrowserSync
          proxy: 'http://localhost:3000/'
        },
        // plugin options
        {
          // prevent BrowserSync from reloading the page
          // and let Webpack Dev Server take care of this
          reload: false
        }
      )
    ]
  },
  {
    entry: [
      './packages/components/bolt.components.js'
    ],
    output: {
      path: path.resolve(process.cwd(), 'www/build'),
      filename: 'bolt.components.js'
    },
    externals: {
      'twig': 'Twig'
    },
    module: module_config,
    plugins: [
      new MinifyPlugin()
    ]
  },
  {
    entry: [
      './packages/components/bolt.templates.js'
    ],
    output: {
      path: path.resolve(process.cwd(), 'www/build'),
      filename: 'bolt.templates.js',
      libraryTarget: 'commonjs2'
    },
    module: module_config,
    plugins: [
      new WebpackEventPlugin([
        {
          hook: 'after-emit',
          callback: (compilation, callback) => {
            console.log('Converting Twig Templates to JSON for Server Side Rendering...');


            // With async/await:
            async function writeTemplateJson() {
              try {
                const templateData = await eval(compilation.assets['bolt.templates.js']._cachedSource);
                await fs.writeJson(__dirname + '/www/build/bolt.templates.json', templateData);
                return callback();
              } catch (err) {
                console.error(err);
              }
            }

            // Make sure the buildDir, www exists before converting our template-specific JS data into JSON
            fs.ensureDir(__dirname + '/www/build', err => {
              if (err){
                console.log(err); // => null
              }

              if (compilation.assets['bolt.templates.js']._cachedSource){
                writeTemplateJson();
              } else {
                console.log('Error! Cannott find bolt.templates.js');
              }
            });
          }
        }
      ])
    ],
    target: 'node'
  }
];
