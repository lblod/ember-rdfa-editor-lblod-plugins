import { PNode, Schema } from '@lblod/ember-rdfa-editor';
import { CodeList, fetchCodeListsByPublisher } from './fetch-data';
import { v4 as uuidv4 } from 'uuid';
import { XSD } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export const MULTI_SELECT_CODELIST_TYPE =
  'http://lblod.data.gift/concepts/57C93E12-A02C-4D4B-8B95-666B6701286C';

export type VariableType = {
  label: string;
  fetchSubtypes?: (endpoint: string, publisher: string) => Promise<CodeList[]>;
  constructor: (
    schema: Schema,
    endpoint?: string,
    selectedCodelist?: CodeList
  ) => PNode;
};

export const DEFAULT_VARIABLE_TYPES: Record<string, VariableType> = {
  text: {
    label: 'text',
    constructor: (schema) => {
      const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
      return schema.node(
        'variable',
        {
          mappingResource: mappingURI,
          type: 'text',
        },
        schema.node('placeholder', { placeholderText: 'text' })
      );
    },
  },
  number: {
    label: 'number',
    constructor: (schema) => {
      const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
      return schema.node(
        'variable',
        {
          mappingResource: mappingURI,
          type: 'number',
          datatype: XSD('integer').prefixed,
        },
        schema.node('placeholder', { placeholderText: 'number' })
      );
    },
  },
  date: {
    label: 'date',
    constructor: (schema) => {
      return unwrap(
        schema.nodes.date.createAndFill({
          mappingResource: `http://data.lblod.info/mappings/${uuidv4()}`,
        })
      );
    },
  },
  location: {
    label: 'location',
    constructor: (schema, endpoint) => {
      const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
      return schema.node(
        'variable',
        {
          type: 'location',
          mappingResource: mappingURI,
          source: endpoint,
        },
        schema.node('placeholder', {
          placeholderText: 'location',
        })
      );
    },
  },
  codelist: {
    label: 'codelist',
    fetchSubtypes: async (endpoint: string, publisher: string) => {
      const codelists = fetchCodeListsByPublisher(endpoint, publisher);
      return codelists;
    },
    constructor: (schema, endpoint, selectedCodelist?: CodeList) => {
      const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
      return schema.node(
        'variable',
        {
          type: 'codelist',
          mappingResource: mappingURI,
          variableResource: selectedCodelist?.uri,
          source: endpoint,
        },
        schema.node('placeholder', {
          placeholderText: selectedCodelist?.label ?? '',
        })
      );
    },
  },
};
