import {
  EditorState,
  PNode,
  SayController,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import {
  findNodeByRdfaId,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { recalculateNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/recalculate-structure-numbers';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  BESLUIT,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

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
    const decision = findAncestors(
      this.controller.mainEditorState.selection.$from,
      (node: PNode) => {
        return hasOutgoingNamedNodeTriple(
          node.attrs,
          RDF('type'),
          BESLUIT('Besluit'),
        );
      },
    )[0];
    const container = getOutgoingTriple(decision.node.attrs, PROV('value'));
    if (container) {
      const location = findNodeByRdfaId(
        this.controller.mainEditorState.doc,
        container.object.value,
      );
      if (location) {
        const insertLocation = location.pos + location.value.nodeSize - 1;
        this.args.controller.withTransaction(
          (tr: Transaction, state: EditorState) => {
            return transactionCombinator(
              state,
              tr.replaceWith(insertLocation, insertLocation, structureNode),
            )([recalculateNumbers]).transaction;
          },
        );
      }
    }
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
