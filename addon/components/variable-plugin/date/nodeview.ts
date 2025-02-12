import Component from '@glimmer/component';
import {
  DecorationSource,
  PNode,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import {
  formatDate,
  validateDateFormat,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/date-helpers';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  contentDecorations?: DecorationSource;
};

export default class DateNodeviewComponent extends Component<Args> {
  get filled() {
    const value = getOutgoingTriple(this.args.node.attrs, RDF('value'))?.object
      .value;
    return !!value;
  }

  get humanReadableDate() {
    const value = getOutgoingTriple(this.args.node.attrs, RDF('value'))?.object
      .value;
    const format = this.args.node.attrs.format as string;
    if (value) {
      if (validateDateFormat(format).type === 'ok') {
        return formatDate(new Date(value), format);
      } else {
        return 'Ongeldig formaat';
      }
    } else {
      return this.label;
    }
  }

  get label() {
    return getOutgoingTriple(this.args.node.attrs, DCT('title'))?.object.value;
  }
}
