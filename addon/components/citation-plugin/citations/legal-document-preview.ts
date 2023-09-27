import Component from '@glimmer/component';
import {
  isBesluitLegalDocument,
  LegalDocument,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';

interface Args {
  legalDocument: LegalDocument;
}

export default class LegalDocumentPreviewComponent extends Component<Args> {
  get isBesluit() {
    return isBesluitLegalDocument(this.args.legalDocument);
  }

  get hasPublicationLink() {
    return this.isBesluit && this.args.legalDocument.meta?.publicationLink;
  }
}
