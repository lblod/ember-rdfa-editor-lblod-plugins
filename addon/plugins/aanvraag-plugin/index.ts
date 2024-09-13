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

export async function fetchAanvragen({
  filter: { municipality },
}: {
  filter: {
    municipality?: string;
  };
}): Promise<AanvraagResults> {
  console.log(`searching for aanvraagen for ${municipality}`);
  return Promise.resolve({
    data: [
      {
        uri: 'http://example.org/test/123',
        title: 'Paint the Atomium pink',
        object: 'The Atomium',
      },
    ],
    meta: { count: 1 },
  });
}
