import Component from '@glimmer/component';
import {
  DecorationSource,
  PNode,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { on } from '@ember/modifier';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  selectNode: () => void;
  updateAttribute: (attr: string, value: unknown) => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  contentDecorations?: DecorationSource;
};

export default class CodelistNodeviewComponent extends Component<Args> {
  get filled() {
    return this.args.node.childCount !== 0;
  }

  get humanReadableCodelistOption() {
    if (this.filled) {
      return this.args.node.children
        .map((child) => child.textContent)
        .join(', ');
    } else {
      return this.args.node.attrs['label'];
    }
  }

  get class() {
    return getClassnamesFromNode(this.args.node);
  }

  <template>
    <AuPill class='{{this.class}} say-pill atomic' {{on 'click' @selectNode}}>
      <span class='{{unless this.filled "unfilled-variable"}}'>
        {{this.humanReadableCodelistOption}}
      </span>
    </AuPill>
  </template>
}
