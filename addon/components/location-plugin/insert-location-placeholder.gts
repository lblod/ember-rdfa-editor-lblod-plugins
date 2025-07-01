import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import not from 'ember-truth-helpers/helpers/not';
import IntlService from 'ember-intl/services/intl';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { type LocationPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { v4 as uuidv4 } from 'uuid';
import { replaceSelectionWithLocation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/_private/utils/node-utils';

interface Signature {
  Args: {
    controller: SayController;
    config: LocationPluginConfig;
    templateMode?: boolean;
  };
  Element: HTMLLIElement;
}

export default class LocationPluginInsertComponent extends Component<Signature> {
  @service declare intl: IntlService;

  get selectedLocationNode() {
    const { selection, schema } = this.controller.activeEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === schema.nodes.oslo_location
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
    return (
      !!this.controller.activeEditorView.props.nodeViews?.oslo_location &&
      !this.selectedLocationNode
    );
  }

  @action
  insertLocationPlaceholder() {
    const uri = `http://data.lblod.info/variables/${
      this.args.templateMode ? '--ref-uuid4-' : ''
    }${uuidv4()}`;
    replaceSelectionWithLocation(
      this.controller,
      uri,
      undefined,
      this.args.config.subjectTypesToLinkTo,
    );
  }

  <template>
    <li class='au-c-list__item' ...attributes>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        {{on 'click' this.insertLocationPlaceholder}}
        @disabled={{not this.canInsert}}
      >
        {{t 'location-plugin.insert-placeholder'}}
      </AuButton>
    </li>
  </template>
}
