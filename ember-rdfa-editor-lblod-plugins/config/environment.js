'use strict';

// eslint-disable-next-line no-undef
module.exports = function (/* environment, appConfig */) {
  return {
    roadsignRegulationPlugin: {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      imageBaseUrl: 'https://register.mobiliteit.vlaanderen.be/',
    },
    besluitTypePlugin: {
      endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
    },
  };
};
