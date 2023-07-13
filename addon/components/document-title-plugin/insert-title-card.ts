import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import insertDocumentTitle from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/commands/insert-document-title';

type Args = {
  controller: SayController;
};
export default class InsertTitleCardComponent extends Component<Args> {
  @service declare intl: IntlService;

  @action
  insertTitle() {
    this.args.controller.doCommand(
      insertDocumentTitle({
        placeholder: this.intl.t(
          'document-title-plugin.document-title-placeholder',
        ),
      }),
      {
        view: this.args.controller.mainEditorView,
      },
    );
    this.args.controller.focus();
  }

  get canInsertTitle() {
    return this.args.controller.checkCommand(
      insertDocumentTitle({
        placeholder: this.intl.t(
          'document-title-plugin.document-title-placeholder',
        ),
      }),
      {
        view: this.args.controller.mainEditorView,
      },
    );
  }
}
