// eslint-disable-next-line node/no-unpublished-require
const webpack = require('webpack');

module.exports = {
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
};
