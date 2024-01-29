import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  Fragment,
  SayController,
  Slice,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { citedText } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/cited-text';
import { CitationPluginEmberComponentConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import {
  LEGISLATION_TYPE_CONCEPTS,
  LEGISLATION_TYPES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/types';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { Article } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/article';
import { LegalDocument } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';

interface Args {
  controller: SayController;
  config: CitationPluginEmberComponentConfig;
}

export default class EditorPluginsCitationInsertComponent extends Component<Args> {
  @tracked showModal = false;
  @tracked legislationTypeUri = LEGISLATION_TYPES.decreet;
  @tracked text = '';
  @tracked legislationType: string | null = null;

  get config() {
    return this.args.config;
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
      (c) => c.label.toLowerCase() === type,
    );
    this.legislationType = found
      ? found.value
      : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).value;
  }

  get disableInsert() {
    if (this.controller.inEmbeddedView) {
      return true;
    }
    const { selection } = this.controller.mainEditorState;
    if (this.config.type === 'ranges') {
      const ranges = this.config.activeInRanges(
        this.controller.mainEditorState,
      );
      for (const range of ranges) {
        if (selection.from > range[0] && selection.from < range[1]) {
          return false;
        }
      }
      return true;
    } else {
      const nodeTypes = this.config.activeInNodeTypes(
        this.controller.schema,
        this.controller.mainEditorState,
      );
      // if the doc node is included, the button should always be active
      // the findParentNodeOfType util we import does NOT consider the doc node
      // in its search.
      if (nodeTypes.has(this.controller.schema.nodes.doc)) {
        return false;
      }
      return !findParentNodeOfType([...nodeTypes])(selection);
    }
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
  insertLegalDocumentCitation(legalDocument: LegalDocument) {
    const type = legalDocument.legislationType?.label || '';
    const uri = legalDocument.uri;
    const url = legalDocument.meta?.publicationLink ?? uri;
    const title = legalDocument.title ?? '';
    this.controller.withTransaction(
      (tr: Transaction) =>
        tr
          .replaceSelection(
            new Slice(
              Fragment.fromArray([
                this.controller.schema.text(`${type} `),
                citedText(this.controller.schema, {
                  title,
                  uri,
                  url,
                }),
              ]),
              0,
              0,
            ),
          )
          .scrollIntoView(),
      { view: this.controller.mainEditorView },
    );
  }

  @action
  insertArticleCitation(legalDocument: LegalDocument, article: Article) {
    const type = legalDocument.legislationType?.label || '';
    const uri = article.uri;
    let title = '';
    if (legalDocument.title) {
      title = `${legalDocument.title}, ${article.number ?? ''}`;
    }
    const { from, to } = this.controller.mainEditorState.selection;
    this.controller.withTransaction(
      (tr: Transaction) =>
        tr.replaceWith(from, to, [
          this.controller.schema.text(`${type} `),
          citedText(this.controller.schema, {
            title,
            uri,
            url: uri,
          }),
        ]),
      { view: this.controller.mainEditorView },
    );
  }
}
