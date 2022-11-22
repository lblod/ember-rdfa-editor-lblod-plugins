'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    autoImport: {
      watchDependencies: ['ember-rdfa-editor-lblod-plugins'],
    },
    sassOptions: {
      includePaths: [
        '../node_modules/@lblod/ember-rdfa-editor-lblod-plugins/dist/styles',
      ],
    },
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app);
};
