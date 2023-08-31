import Component from '@glimmer/component';
import {
  isBesluitLegalDocument,
  LegalDocument,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';

interface Args {
  decision: LegalDocument;
}

export default class DecisionPreviewComponent extends Component<Args> {
  get isDecision() {
    return isBesluitLegalDocument(this.args.decision);
  }

  get hasPublicationLink() {
    return this.isDecision && this.args.decision.meta?.publicationLink;
  }
}
