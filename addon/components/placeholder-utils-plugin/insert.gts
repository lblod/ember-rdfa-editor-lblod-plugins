import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import not from 'ember-truth-helpers/helpers/not';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { type LocationPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';

interface Signature {
  Args: {
    controller: SayController;
    config: LocationPluginConfig;
    templateMode?: boolean;
  };
  Element: HTMLLIElement;
}

export default class PlaceholderUtilsPluginInsertComponent extends Component<Signature> {
  get selectedPlaceholderNode() {
    const { selection, schema } = this.controller.activeEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === schema.nodes.placeholder
    ) {
      return selection.node;
    } else {
      return;
    }
  }

  get controller() {
    return this.args.controller;
  }

  get canInsert() {
    return !this.selectedPlaceholderNode;
  }

  @action
  insertPlaceholder() {
    this.controller.withTransaction((tr) => {
      tr.replaceSelectionWith(
        this.controller.schema.node('placeholder', {
          placeholderText: 'placeholder',
        }),
      );
      if (tr.selection.$anchor.nodeBefore) {
        const resolvedPos = tr.doc.resolve(
          tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
        );
        tr.setSelection(new NodeSelection(resolvedPos));
      }
      return tr;
    });
  }

  <template>
    <li class='au-c-list__item' ...attributes>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        {{on 'click' this.insertPlaceholder}}
        @disabled={{not this.canInsert}}
      >
        {{t 'location-plugin.insert-placeholder'}}
      </AuButton>
    </li>
  </template>
}
