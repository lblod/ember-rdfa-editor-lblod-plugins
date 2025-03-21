'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      // {
      //   name: 'ember-beta',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': await getChannelURL('beta'),
      //     },
      //   },
      // },
      // {
      //   name: 'ember-canary',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': await getChannelURL('canary'),
      //     },
      //   },
      // },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
