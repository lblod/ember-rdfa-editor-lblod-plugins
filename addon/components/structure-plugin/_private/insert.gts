import {
  EditorState,
  SayController,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { recalculateNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/recalculate-structure-numbers';

interface Sig {
  Args: { controller: SayController };
}
export default class InsertStructureComponent extends Component<Sig> {
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
