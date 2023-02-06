import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  Fragment,
  ProseController,
  Slice,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import {
  Article,
  Decision,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/vlaamse-codex';
import { citedText } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/cited-text';
import {
  CitationPlugin,
  CitationPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import {
  LEGISLATION_TYPE_CONCEPTS,
  LEGISLATION_TYPES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legislation-types';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';

interface Args {
  controller: ProseController;
  widgetArgs: { plugin: CitationPlugin; config: CitationPluginConfig };
}

export default class EditorPluginsCitationInsertComponent extends Component<Args> {
  @tracked showModal = false;
  @tracked legislationTypeUri = LEGISLATION_TYPES.decreet;
  @tracked text = '';
  @tracked legislationType: string | null = null;

  get config() {
    return this.args.widgetArgs.config;
  }

  get selectedLegislationTypeUri(): string {
    return this.selectedLegislationType.value;
  }

  get selectedLegislationType() {
    const type = this.legislationType;
    const found = LEGISLATION_TYPE_CONCEPTS.find((c) => c.value === type);
    return found || unwrap(LEGISLATION_TYPE_CONCEPTS[0]);
  }

  @action
  selectLegislationType(type: string) {
    type = type.toLowerCase();
    const found = LEGISLATION_TYPE_CONCEPTS.find(
      (c) => c.label.toLowerCase() === type
    );
    this.legislationType = found
      ? found.value
      : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).value;
  }

  get disableInsert() {
    if (this.controller.inEmbeddedView) {
      return true;
    }
    const { selection } = this.controller.state;
    if (this.config.type === 'ranges') {
      const ranges = this.config.activeInRanges(this.controller.state);
      for (const range of ranges) {
        if (selection.from >= range[0] && selection.to <= range[1]) {
          return false;
        }
      }
      return true;
    } else {
      const nodeTypes = this.config.activeInNodeTypes(
        this.controller.schema,
        this.controller.state
      );
      return !findParentNodeOfType([...nodeTypes])(selection);
    }
  }

  get plugin() {
    return this.args.widgetArgs.plugin;
  }

  get activeRanges() {
    return this.plugin.getState(this.controller.state)?.activeRanges;
  }

  get controller() {
    return this.args.controller;
  }

  @action
  openModal() {
    // we focus BEFORE openening the modal, since the modal uses ember-focus-trap
    // that takes control of the focus, and gives it back when disabled
    // so we have to reset the focus to the editor before opening (because
    // we lost it upon clicking the button)
    this.controller.focus();
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  insertDecisionCitation(decision: Decision) {
    const type = decision.legislationType?.label || '';
    const uri = decision.uri;
    const title = decision.title ?? '';
    this.controller.withTransaction((tr: Transaction) =>
      tr
        .replaceSelection(
          new Slice(
            Fragment.fromArray([
              this.controller.schema.text(`${type} `),
              citedText(this.controller.schema, title, uri),
            ]),
            0,
            0
          )
        )
        .scrollIntoView()
    );
  }

  @action
  insertArticleCitation(decision: Decision, article: Article) {
    const type = decision.legislationType?.label || '';
    const uri = article.uri;
    let title = '';
    if (decision.title) {
      title = `${decision.title}, ${article.number ?? ''}`;
    }
    const { from, to } = this.args.controller.state.selection;
    this.controller.withTransaction((tr: Transaction) =>
      tr.replaceWith(from, to, [
        this.controller.schema.text(`${type} `),
        citedText(this.controller.schema, title, uri),
      ])
    );
  }
}
