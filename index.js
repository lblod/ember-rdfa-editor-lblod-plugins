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
      plugins: [],
    },
  },

  init() {
    this._super.init.apply(this, arguments);
    this.maybeAddConcurrencyPlugin();
  },

  // Stolen from ember-appuniversum
  maybeAddConcurrencyPlugin() {
    const VersionChecker = require('ember-cli-version-checker');
    const checker = new VersionChecker(this.project);
    const dep = checker.for('ember-concurrency');

    if (dep.gte('4.0.0')) {
      // ember-concurrency v4+ requires a custom babel transform. Once we drop ember-concurrency v3 support we can remove this conditional registration.
      this.options.babel.plugins.push(
        // require is missing as this lib uses a too old ember-concurrency version
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      );
    }
  },
};
