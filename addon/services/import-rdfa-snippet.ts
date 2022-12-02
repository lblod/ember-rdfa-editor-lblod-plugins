import Service from '@ember/service';
import { A } from '@ember/array';
import ContextScanner from '@lblod/marawa/rdfa-context-scanner';
import RdfaBlock from '@lblod/marawa/rdfa-block';
import NativeArray from '@ember/array/-private/native-array';

type RequestParams = {
  source: string;
  uri: string;
  omitCredentials: boolean;
  mock: boolean;
};
/*
 * @module editor-import-snippet-plugin
 * @class ImportRdfaSnippet
 * @constructor
 */
class RdfaSnippet {
  constructor(
    readonly source: string,
    readonly type: string,
    readonly content: string,
    readonly blocks: RdfaBlock[]
  ) {}
}

/**
 * Service responsible for fetching and storing a snippet
 *
 * Assumptions
 * -----------
 *  - one toplevel rdfa block per snippet
 *
 * @module editor-import-snippet-plugin
 * @class ImportRdfaSnippet
 * @constructor
 * @extends EmberService
 */
export default class ImportRdfaSnippet extends Service {
  errors;

  snippets: NativeArray<RdfaSnippet>;

  contextScanner: ContextScanner;

  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);
    this.snippets = A();
    this.errors = A();
    this.contextScanner = new ContextScanner();
  }

  /**
   * Download, processes and stores snippet
   * @method downloadSnippet
   * @param {Object}: {source}
   * @return {String}
   * @public
   */
  async downloadSnippet(params: RequestParams) {
    const data = await this.getSnippet(params);
    if (data) await this.processSnippet(params, data);
  }

  /**
   * Remove a snippet from the store, typically after using it
   * @method removeSnippet
   * @return void
   * @public
   */
  removeSnippet(snippet: RdfaSnippet) {
    const index = this.snippets.indexOf(snippet);
    if (index >= 0) {
      this.snippets.splice(index, 1);
    }
  }

  /**
   * Return snippets for a given type, current supported types are 'roadsign' and 'generic'
   * @method snippetsForType
   * @params {String} type
   * @return {Array} array of RdfaSnippets
   */
  snippetsForType(type: string) {
    return this.snippets.filter((snippet) => snippet.type === type);
  }

  /**
   * Fetches snippet from remote
   * @method processSnippet
   * @param params.omitCredentials {String} if truthy, the fetch call will omit credentials (this is important for endpoints that only provide simple CORS headers). When not set or falsy we fetch with "include" credentials. This means the endpoint needs to provide the Access-Control-Allow-Credentials and Access-Controlled-Allow-Origin needs to be set to the requesting domain ('*' is not allowed)
   * @param params.source {String} the URL of the document to fetch
   * @result {Response} result from ember fetch call
   * @private
   */
  async getSnippet(params: RequestParams): Promise<Response | null> {
    let data = null;
    try {
      const credentials = params.omitCredentials ? 'omit' : 'include';
      data = await fetch(params.source, {
        credentials,
        headers: { Accept: 'text/html' },
      });

      if (!data) {
        this.errors.pushObject({
          source: params.source,
          details: `No data found for ${params.uri}`,
        });
      }
    } catch (err) {
      this.errors.pushObject({
        source: params.source,
        details: `Error fetching data ${params.uri}: ${err as string}`,
      });
    }
    return data;
  }

  /**
   * heuristic to determine the type of snippet
   * currently just a very basic check if a type exists in the snippet.
   * @method determineType
   */
  determineType(rdfaBlocks: RdfaBlock[]): string {
    const triples = rdfaBlocks
      .map((block) => block.context)
      .reduce((prevValue, next) => [...prevValue, ...next])
      .filter((v, i, a) => a.indexOf(v) === i); //This filters only unique values
    const types = triples
      .filter((triple) => triple.predicate === 'a')
      .map((triple) => triple.object)
      .filter((v, i, a) => a.indexOf(v) === i); //This filters only unique values
    if (
      types.includes(
        'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbord-Verkeersteken'
      )
    ) {
      return 'roadsign';
    } else {
      return 'generic';
    }
  }

  /**
   * Processes and stores snippet
   * @method processSnippet
   * @private
   */
  async processSnippet(params: RequestParams, data: Response) {
    try {
      const snippet = await data.text();
      const snippetElements = this.htmlToElements(snippet);
      const rdfaBlocks = snippetElements
        .map((e) => this.contextScanner.analyse(e))
        .reduce((acc, blocks) => [...acc, ...blocks], []);
      const type = this.determineType(rdfaBlocks);
      this.storeSnippet(params.source, type, snippet, rdfaBlocks);
    } catch (err: unknown) {
      this.errors.pushObject({
        source: params.source,
        details: `Error fetching data ${params.uri}: ${err as string}`,
      });
    }
  }

  /**
   * Make HTML Content Template from string
   * @method htmlToElement
   * @param {String}
   * @return {Object}
   * @private
   */
  htmlToElements(html: string): Element[] {
    const template = document.createElement('template');
    template.innerHTML = html;
    return [...template.content.children];
  }

  /**
   * Stores snippet
   * @method storeSnippet
   * @param {String} source the source url of the snippet
   * @param {String} content the unparsed text content of the snippet
   * @param {Array} block array of richnodes representing the content of the snippet
   * @private
   */
  storeSnippet(
    source: string,
    type: string,
    content: string,
    blocks: RdfaBlock[]
  ): void {
    this.snippets.pushObject(new RdfaSnippet(source, type, content, blocks));
  }
}
