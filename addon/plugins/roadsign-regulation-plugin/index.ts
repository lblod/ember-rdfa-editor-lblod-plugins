export type RoadsignRegulationPluginOptions = {
  endpoint: string;
  imageBaseUrl: string;
  articleUriGenrator?: () => string;
  /** Instead of finding a decision node in the document, pass the relevant URI and type */
  decisionContext?: {
    decisionUri: string;
    decisionType?: string;
  };
};
