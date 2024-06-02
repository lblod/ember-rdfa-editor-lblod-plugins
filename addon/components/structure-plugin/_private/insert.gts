import {
  EditorState,
  SayController,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import {
  TransactionResult,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';

type Args = {
  controller: SayController;
};
export default class InsertStructureComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  doInsert() {
    const structureNode = buildArticleStructure(this.schema);
    if (!structureNode) {
      return;
    }
    this.args.controller.withTransaction(
      (tr: Transaction, state: EditorState) => {
        return transactionCombinator(
          state,
          tr.replaceSelectionWith(structureNode),
        )([recalculateNumbers]).transaction;
      },
    );
  }

  <template>
    <li class='au-c-list__item'>
      <AuButton
        @icon='add'
        @iconAlignment='left'
        @skin='link'
        {{on 'click' this.doInsert}}
      >
        Insert structure
      </AuButton>
    </li>
  </template>
}
function recalculateNumbers(state: EditorState): TransactionResult<boolean> {
  const tr = state.tr;
  const doc = tr.doc;
  let counter = 0;
  doc.descendants((node, pos) => {
    if (
      node.type.name === 'structure' &&
      hasOutgoingNamedNodeTriple(node.attrs, RDF('type'), BESLUIT('Artikel'))
    ) {
      counter += 1;
      if (counter !== Number(node.attrs.number)) {
        tr.setNodeAttribute(pos, 'number', counter);
      }
    }
    return true;
  });
  return { transaction: tr, result: true, initialState: state };
}
