'use strict';

// eslint-disable-next-line no-undef
module.exports = function (/* environment, appConfig */) {
  return {
    besluitTypePlugin: {
      endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
    },
  };
};
