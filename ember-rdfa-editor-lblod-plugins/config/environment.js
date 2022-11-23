'use strict';

// eslint-disable-next-line no-undef
module.exports = function (/* environment, appConfig */) {
  return {
    besluitTypePlugin: {
      endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
    },
    templateVariablePlugin: {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      zonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
      nonZonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
    },
  };
};
