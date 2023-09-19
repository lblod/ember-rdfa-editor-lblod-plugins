'use strict';

module.exports = {
  name: require('./package').name,
  isDevelopingAddon() {
    return process.env.EMBER_ENV === 'development';
  },
  options: {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    babel: {
      sourceMaps: 'inline',
    },
  },
};
