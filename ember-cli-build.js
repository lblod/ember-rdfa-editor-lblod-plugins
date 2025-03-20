'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const webpack = require('webpack');

module.exports = function (defaults) {
  const app = new EmberAddon(defaults, {
    // Add options here
    sassOptions: {
      sourceMapEmbed: true,
    },
    '@appuniversum/ember-appuniversum': {
      disableWormholeElement: true,
    },
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    fingerprint: {
      exclude: [
        'images/layers-2x.png',
        'images/layers.png',
        'images/marker-icon-2x.png',
        'images/marker-icon.png',
        'images/marker-shadow.png',
      ],
    },
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticInvokables: true,
    staticEmberSource: true,
    packagerOptions: {
      webpackConfig: {
        node: {
          global: true,
          __filename: true,
          __dirname: true,
        },
        resolve: {
          fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
          },
        },
        plugins: [
          new webpack.ProvidePlugin({
            process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer'],
          }),
        ],
        devtool: 'source-map',
      },
    },
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
