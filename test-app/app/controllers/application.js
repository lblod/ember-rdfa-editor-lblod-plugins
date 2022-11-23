import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service importRdfaSnippet;
  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
  };

  plugins = [
    'besluit-type',
    'citaten',
    'import-snippet',
    {
      name: 'insert-variable',
      options: {
        defaultEndpoint: 'https://dev.roadsigns.lblod.info/sparql',
        variableTypes: [
          'text',
          'number',
          'date',
          'codelist',
          {
            label: 'Dummy Variable',
            fetchSubtypes: async () => {
              const codelists = [
                {
                  uri: '1',
                  label: '1',
                },
                {
                  uri: '2',
                  label: '2',
                },
                {
                  uri: '3',
                  label: '3',
                },
              ];
              return codelists;
            },
            template: (endpoint, selectedCodelist) => `
              <span property="ext:codelist" resource="${selectedCodelist.uri}"></span>
              <span property="dct:type" content="location"></span>
              <span property="dct:source" resource="${endpoint}"></span>
              <span property="ext:content" datatype="xsd:date">
                <span class="mark-highlight-manual">\${${selectedCodelist.label}}</span>
              </span>
            `,
          },
        ],
      },
    },
    'rdfa-date',
    'standard-template',
    'table-of-contents',
    'template-variable',
  ];

  @action
  setPrefixes(element) {
    element.setAttribute('prefix', this.prefixToAttrString(this.prefixes));
  }

  prefixToAttrString(prefix) {
    let attrString = '';
    Object.keys(prefix).forEach((key) => {
      let uri = prefix[key];
      attrString += `${key}: ${uri} `;
    });
    return attrString;
  }

  @action
  async rdfaEditorInit() {
    await this.importRdfaSnippet.downloadSnippet({
      omitCredentials: 'true',
      source:
        'https://dev.kleinbord.lblod.info/snippets/example-opstellingen.html',
      mock: 'true',
    });
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
