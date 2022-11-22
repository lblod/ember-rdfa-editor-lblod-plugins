import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service importRdfaSnippet;
  plugins = [
    'besluit-type',
    'citaten',
    'import-snippet',
    'rdfa-date',
    'standard-template',
    'table-of-contents',
  ];

  @action
  async rdfaEditorInit(controller) {
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
