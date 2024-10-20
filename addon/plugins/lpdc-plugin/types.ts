export type LpdcPluginConfig = {
  endpoint: string;
  /** Decision URI to use for RDFa links to avoid needing to look for one in the document */
  decisionUri?: string;
};

export type LPDC = { uri: string; name: string };
