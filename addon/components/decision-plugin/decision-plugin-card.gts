import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  insertMotivation,
  insertArticleContainer,
  insertDescription,
  insertTitle,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
import type { PNode, SayController, Selection } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  BESLUIT,
  ELI,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { not } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import { TemplateOnlyComponent } from '@ember/component/template-only';

interface DecisionCardOptions {
  articleUriGenerator?: () => string;
}
interface Sig {
  Args: {
    controller: SayController;
    options: DecisionCardOptions;
  };
}

export default class DecisionPluginCard extends Component<Sig> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }
  get selection(): Selection {
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

  @action
  focus() {
    this.controller.focus();
  }
  get canInsertTitle() {
    return (
      this.decisionNodeLocation &&
      !getOutgoingTriple(this.decisionNodeLocation.node.attrs, ELI('title'))
    );
  }
  @action
  insertTitle() {
    if (this.decisionNodeLocation) {
      this.controller.doCommand(
        insertTitle({
          placeholderText: this.intl.t(
            'besluit-plugin.placeholder.decision-title',
          ),
          decisionLocation: this.decisionNodeLocation,
        }),
        { view: this.controller.mainEditorView },
      );
    }
    this.focus();
  }
  get canInsertDescription() {
    return (
      this.decisionNodeLocation &&
      !getOutgoingTriple(
        this.decisionNodeLocation.node.attrs,
        ELI('description'),
      )
    );
  }
  @action
  insertDescription() {
    if (this.decisionNodeLocation) {
      this.controller.doCommand(
        insertDescription({
          placeholderText: this.intl.t(
            'besluit-plugin.placeholder.decision-description',
          ),
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

  get missingArticleBlock() {
    return (
      this.decisionNodeLocation &&
      !getOutgoingTriple(this.decisionNodeLocation.node.attrs, PROV('value'))
    );
  }
  @action
  insertArticleBlock() {
    if (this.decisionNodeLocation) {
      this.controller.doCommand(
        insertArticleContainer({
          intl: this.intl,
          decisionLocation: this.decisionNodeLocation,
          articleUriGenerator: this.args.options.articleUriGenerator,
        }),
        {
          view: this.controller.mainEditorView,
        },
      );
    }
    this.focus();
  }

  <template>
    {{#if this.canInsertTitle}}
      <ValidationCard
        @enabled={{this.canInsertTitle}}
        @title={{t 'besluit-plugin.missing-title-warning'}}
        @onClickFix={{this.insertTitle}}
      >
        {{t 'besluit-plugin.insert.decision-title'}}
      </ValidationCard>
    {{/if}}
    {{#if this.canInsertDescription}}
      <ValidationCard
        @enabled={{this.canInsertDescription}}
        @title={{t 'besluit-plugin.missing-description-warning'}}
        @onClickFix={{this.insertDescription}}
      >
        {{t 'besluit-plugin.insert.description'}}
      </ValidationCard>
    {{/if}}
    {{#if this.canInsertMotivation}}
      <ValidationCard
        @enabled={{this.canInsertMotivation}}
        @title={{t 'besluit-plugin.missing-motivation-warning'}}
        @onClickFix={{this.insertMotivation}}
      >
        {{t 'besluit-plugin.insert.motivation'}}
      </ValidationCard>
    {{/if}}
    {{#if this.missingArticleBlock}}
      <ValidationCard
        @enabled={{this.missingArticleBlock}}
        @title={{t 'besluit-plugin.missing-article-block-warning'}}
        @onClickFix={{this.insertArticleBlock}}
      >
        {{t 'besluit-plugin.insert.article-block'}}
      </ValidationCard>
    {{/if}}
  </template>
}
interface ValidationCardSig {
  Args: {
    enabled: boolean;
    onClickFix: () => void;
    title: string;
  };
  Blocks: {
    default: [];
  };
}
const ValidationCard: TemplateOnlyComponent<ValidationCardSig> = <template>
  <AuAlert
    class='say-validation-alert'
    @skin='warning'
    @closable={{false}}
    @icon={{AlertTriangleIcon}}
    @title={{@title}}
  >
    <AuButton
      @iconAlignment='left'
      @skin='link-secondary'
      @disabled={{not @enabled}}
      {{on 'click' @onClickFix}}
    >
      {{yield}}
    </AuButton>
  </AuAlert>
</template>;
