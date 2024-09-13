export interface AanvraagPluginConfig {
  endpoint: string;
}

export type Aanvraag = {
  uri: string;
  title: string;
  object: string;
};
export interface AanvraagResults {
  data: Aanvraag[];
  meta: {
    count: number;
  };
}

export { fetchAanvragen } from './fetch-data';
