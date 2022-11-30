import { fetchCodeListsByPublisher } from './fetch-data';

export const defaultVariableTypes = {
  text: {
    label: 'text',
    template: `
      <span property="dct:type" content="text"></span>
      <span property="ext:content">
        <span class="mark-highlight-manual">\${text}</span>
      </span>
    `,
  },
  number: {
    label: 'number',
    template: `
      <span property="dct:type" content="number"></span>
      <span property="ext:content" datatype="xsd:integer">
        <span class="mark-highlight-manual">\${number}</span>
      </span>
    `,
  },
  date: {
    label: 'date',
    template: `
      <span property="dct:type" content="date"></span>
      <span property="ext:content" datatype="xsd:date">
        <span class="mark-highlight-manual">\${date}</span>
      </span>
    `,
  },
  location: {
    label: 'location',
    template: (endpoint) => `
      <span property="dct:type" content="location"></span>
      <span property="dct:source" resource="${endpoint}"></span>
      <span property="ext:content">
        <span class="mark-highlight-manual">\${location}</span>
      </span>
    `,
  },
  codelist: {
    label: 'codelist',
    fetchSubtypes: async (endpoint, publisher) => {
      const codelists = fetchCodeListsByPublisher(endpoint, publisher);
      return codelists;
    },
    template: (endpoint, selectedCodelist) => `
      <span property="ext:codelist" resource="${selectedCodelist.uri}"></span>
      <span property="dct:type" content="codelist"></span>
      <span property="dct:source" resource="${endpoint}"></span>
      <span property="ext:content">
        <span class="mark-highlight-manual">\${${selectedCodelist.label}}</span>
      </span>
    `,
  },
};
