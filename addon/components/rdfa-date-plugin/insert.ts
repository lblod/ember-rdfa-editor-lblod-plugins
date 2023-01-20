import Component from '@glimmer/component';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { NodeSelection } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: ProseController;
};

export default class RdfaDatePluginInsertComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  insertDate(onlyDate: boolean) {
    this.controller.withTransaction((tr) => {
      tr.replaceSelectionWith(
        this.schema.node('date', {
          onlyDate,
        })
      );
      if (tr.selection.$anchor.nodeBefore) {
        const resolvedPos = tr.doc.resolve(
          tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize
        );
        tr.setSelection(new NodeSelection(resolvedPos));
      }
      return tr;
    }, true);
  }
}
