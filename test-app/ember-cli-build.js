'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const webpack = require('webpack');
module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    autoImport: {
      watchDependencies: ['ember-rdfa-editor-lblod-plugins'],
      webpack: {
        plugins: [
          new webpack.ProvidePlugin({
            process: 'process/browser',
          }),
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
          }),
        ],
      },
    },
    sassOptions: {
      includePaths: ['../node_modules/'],
    },
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app);
};
