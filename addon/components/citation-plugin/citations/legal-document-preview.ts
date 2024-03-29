import Component from '@glimmer/component';
import {
  isBesluitLegalDocument,
  LegalDocument,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';
import { CalendarIcon } from '@appuniversum/ember-appuniversum/components/icons/calendar';
import { PlusTextIcon } from '@appuniversum/ember-appuniversum/components/icons/plus-text';
import { LinkExternalIcon } from '@appuniversum/ember-appuniversum/components/icons/link-external';
import { ManualIcon } from '@appuniversum/ember-appuniversum/components/icons/manual';

interface Args {
  legalDocument: LegalDocument;
}

export default class LegalDocumentPreviewComponent extends Component<Args> {
  ManualIcon = ManualIcon;
  LinkExternalIcon = LinkExternalIcon;
  PlusTextIcon = PlusTextIcon;
  CalendarIcon = CalendarIcon;

  get isBesluit() {
    return isBesluitLegalDocument(this.args.legalDocument);
  }

  get hasPublicationLink() {
    return this.isBesluit && this.args.legalDocument.meta?.publicationLink;
  }
}
