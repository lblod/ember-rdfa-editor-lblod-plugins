import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  insertMotivation,
  insertArticleContainer,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { VALIDATION_KEY } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
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
import { NodeWithPos } from '@curvenote/prosemirror-utils';

type Args = {
  controller: SayController;
};

export default class DecisionPluginCard extends Component<Args> {
  AlertTriangleIcon = AlertTriangleIcon;

  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }
  get selection() {
    return this.controller.mainEditorState.selection;
  }

  get decisionNodeLocation(): NodeWithPos | null {
    return (
      findAncestors(this.selection.$from, (node: PNode) => {
        return hasOutgoingNamedNodeTriple(
          node.attrs,
          RDF('type'),
          BESLUIT('Besluit'),
        );
      })[0] ?? null
    );
  }

  focus() {
    this.controller.focus();
  }

  @action
  insertMotivation() {
    if (this.decisionNodeLocation) {
      this.controller.doCommand(
        insertMotivation({
          intl: this.intl,
          decisionLocation: this.decisionNodeLocation,
        }),
        {
          view: this.controller.mainEditorView,
        },
      );
    }
    this.focus();
  }

  get canInsertMotivation() {
    return (
      this.decisionNodeLocation &&
      !getOutgoingTriple(
        this.decisionNodeLocation.node.attrs,
        BESLUIT('motivering'),
      )
    );
  }

  @action
  insertArticleBlock() {
    this.controller.doCommand(insertArticleContainer({ intl: this.intl }), {
      view: this.controller.mainEditorView,
    });
    this.focus();
  }

  get missingArticleBlock() {
    return (
      this.decisionNodeLocation &&
      !getOutgoingTriple(
        this.decisionNodeLocation.node.attrs,
        PROV('value')
      )
    );
  }
}
