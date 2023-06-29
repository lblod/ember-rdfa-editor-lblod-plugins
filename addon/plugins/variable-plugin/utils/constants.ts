import { Attrs, PNode, Schema } from '@lblod/ember-rdfa-editor';
import { CodeList, fetchCodeListsByPublisher } from './fetch-data';
import { v4 as uuidv4 } from 'uuid';
import { XSD } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export const MULTI_SELECT_CODELIST_TYPE =
  'http://lblod.data.gift/concepts/57C93E12-A02C-4D4B-8B95-666B6701286C';

export type VariableType = {
  label: string;
  fetchSubtypes?: (endpoint: string, publisher: string) => Promise<CodeList[]>;
  constructor: (props: {
    schema: Schema;
    label?: string;
    attributes?: Attrs;
    codelist?: CodeList;
  }) => PNode;
};

export const DEFAULT_VARIABLE_TYPES: Record<string, VariableType> = {
  text: {
    label: 'text',
    constructor: ({ schema, label = 'text' }) => {
      const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
      const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
      return schema.node(
        'variable',
        {
          mappingResource: mappingURI,
          variableInstance,
          type: 'text',
          label,
        },
        schema.node('placeholder', { placeholderText: 'text' })
      );
    },
  },
  number: {
    label: 'number',
    constructor: ({ schema, attributes, label = 'number' }) => {
      const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
      const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;

      return unwrap(
        schema.nodes.number.createAndFill({
          mappingResource: mappingURI,
          variableInstance,
          type: 'number',
          datatype: XSD('integer').prefixed,
          label,
          ...attributes,
        })
      );
    },
  },
  date: {
    label: 'date',
    constructor: ({ schema, label = 'date' }) => {
      return unwrap(
        schema.nodes.date.createAndFill({
          mappingResource: `http://data.lblod.info/mappings/${uuidv4()}`,
          value: null,
          label,
        })
      );
    },
  },
  location: {
    label: 'location',
    constructor: ({ schema, attributes, label = 'location' }) => {
      const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
      const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
      return schema.node(
        'variable',
        {
          type: 'location',
          mappingResource: mappingURI,
          variableInstance,
          label,
          ...attributes,
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
    constructor: ({ schema, attributes, codelist, label }) => {
      const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
      const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
      return schema.node(
        'variable',
        {
          type: 'codelist',
          mappingResource: mappingURI,
          codelistResource: codelist?.uri,
          variableInstance,
          label: label ?? codelist?.label,
          ...attributes,
        },
        schema.node('placeholder', {
          placeholderText: codelist?.label,
        })
      );
    },
  },
};

export const MINIMUM_VALUE_PNODE_KEY = 'minimumValue';
export const MAXIMUM_VALUE_PNODE_KEY = 'maximumValue';
export const WRITTEN_NUMBER_PNODE_KEY = 'writtenNumber';

export const MINIMUM_VALUE_HTML_ATTRIBUTE_KEY = 'data-minimum-value';
export const MAXIMUM_VALUE_HTML_ATTRIBUTE_KEY = 'data-maximum-value';
export const WRITTEN_NUMBER_HTML_ATTRIBUTE_KEY = 'data-written-number';
