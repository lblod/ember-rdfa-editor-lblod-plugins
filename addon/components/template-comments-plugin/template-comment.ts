import Component from '@glimmer/component';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { CircleInfoIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-info';

export default class TemplateCommentsPluginTemplateCommentComponent extends Component<EmberNodeArgs> {
  CircleInfoIcon = CircleInfoIcon;

  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get translation() {
    return {
      title: this.intl.t('template-comments-plugin.title', {
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
