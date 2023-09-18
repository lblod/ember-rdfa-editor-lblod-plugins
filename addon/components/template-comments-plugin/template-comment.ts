import Component from '@glimmer/component';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

export default class TemplateCommentsPluginTemplateCommentComponent extends Component<EmberNodeArgs> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get translation() {
    return {
      title: this.intl.t('template-comments-plugin.long-title', {
        locale: this.documentLanguage,
      }),
    };
  }

  get selectionInside() {
    const { pos: selectPos } = this.controller.mainEditorState.selection.$from;
    const nodePos = this.args.getPos();
    const startSelectionInsideNode =
      nodePos !== undefined &&
      selectPos > nodePos &&
      selectPos < nodePos + this.args.node.nodeSize;
    return startSelectionInsideNode;
  }
}
