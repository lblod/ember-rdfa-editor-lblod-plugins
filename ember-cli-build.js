'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
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
    packagerOptions: {
      webpackConfig: require('./webpack-config'),
    },
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
