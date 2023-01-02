import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  TableOfContentsConfig,
  TABLE_OF_CONTENTS_DEFAULT_CONFIG,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/utils/constants';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type Args = {
  controller: ProseController;
  widgetArgs: {
    config: TableOfContentsConfig;
  };
};

export default class TableOfContentsCardComponent extends Component<Args> {
  get toggled() {
    return !!this.tableOfContentsRange;
  }

  get controller() {
    return this.args.controller;
  }

  get tableOfContentsRange() {
    let result: { from: number; to: number } | undefined;
    this.controller.state.doc.descendants((node, pos) => {
      if (node.type === this.controller.schema.nodes['table_of_contents']) {
        result = { from: pos, to: pos + node.nodeSize };
      }
      return !result;
    });
    return result;
  }

  get config() {
    return this.args.widgetArgs.config ?? TABLE_OF_CONTENTS_DEFAULT_CONFIG;
  }

  @action
  toggle() {
    if (this.tableOfContentsRange) {
      const { from, to } = this.tableOfContentsRange;
      this.controller.withTransaction((tr) => {
        return tr.deleteRange(from, to);
      });
    } else {
      const { schema } = this.controller;
      this.controller.withTransaction((tr) => {
        return tr.replaceRangeWith(
          0,
          0,
          schema.node('table_of_contents', {
            config: this.config,
          })
        );
      });
    }
  }
}
