'use strict';

module.exports = {
  name: require('./package').name,
  isDevelopingAddon() {
    return process.env.EMBER_ENV === 'development';
  },
};
