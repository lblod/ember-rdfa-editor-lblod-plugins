import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  plugins = ['citaten-plugin'];

  @action
  rdfaEditorInit(controller) {
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
