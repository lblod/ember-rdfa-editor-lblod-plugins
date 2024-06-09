import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  EditorState,
  PNode,
  SayController,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/utils/build-article-structure';
import { recalculateNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/recalculate-structure-numbers';
import {
  BESLUIT,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import {
  findNodeByRdfaId,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import t from 'ember-intl/helpers/t';

interface Sig {
  Args: { controller: SayController };
}
export default class InsertArticleComponent extends Component<Sig> {
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
        {{t 'besluit-plugin.insert.article'}}
      </AuButton>
    </li>
  </template>
}
