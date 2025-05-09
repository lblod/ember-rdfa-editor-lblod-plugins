import Component from '@glimmer/component';
import {
  DecorationSource,
  PNode,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';
import {
  formatDate,
  validateDateFormat,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/date-helpers';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

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
    const value = this.args.node.attrs['content'] as Option<string>;
    return !!value;
  }

  get humanReadableDate() {
    const value = this.args.node.attrs['content'] as Option<string>;
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

  get class() {
    return getClassnamesFromNode(this.args.node);
  }

  get label() {
    return this.args.node.attrs['label'] as Option<string>;
  }
}
