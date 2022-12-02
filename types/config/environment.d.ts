declare const config: {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none' | 'auto';
  rootURL: string;
  APP: Record<string, unknown>;
  roadsignRegulationPlugin: {
    endpoint: string;
    imageBaseUrl: string;
  };
  besluitTypePlugin: {
    endpoint: string;
  };
  templateVariablePlugin: {
    endpoint: string;
    zonalLocationCodelistUri: string;
    nonZonalLocationCodelistUri: string;
  };
};

export default config;
