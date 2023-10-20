const editorWebPackConfig = require('@lblod/ember-rdfa-editor/webpack-config');
// eslint-disable-next-line node/no-unpublished-require
const webpack = require('webpack');

module.exports = {
  ...editorWebPackConfig,
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
