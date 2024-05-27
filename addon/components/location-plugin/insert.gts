import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import not from 'ember-truth-helpers/helpers/not';
import IntlService from 'ember-intl/services/intl';
import t from 'ember-intl/helpers/t';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import { replaceSelectionWithAddress } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/node-utils';
import Edit from './edit';
import LocationMap from './map';

interface Signature {
  Args: {
    controller: SayController;
    defaultMunicipality?: string;
  };
  Element: HTMLLIElement;
}

export default class LocationPluginInsertComponent extends Component<Signature> {
  @service declare intl: IntlService;
  @tracked modalOpen = false;
  @tracked addressToInsert?: Address;
  @tracked isLoading = false;

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get modalTitle() {
    return this.selectedAddressVariable
      ? this.intl.t('location-plugin.modal.edit')
      : this.intl.t('location-plugin.modal.insert');
  }

  get selectedAddressVariable(): ResolvedPNode | null {
    const { selection, schema } = this.controller.activeEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === schema.nodes.address
    ) {
      return { value: selection.node, pos: selection.from };
    }
    return null;
  }

  get canInsertAddress() {
    if (this.controller.activeEditorView.props.nodeViews?.address) {
      return true;
    } else {
      return false;
    }
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  @action
  insertOrEditAddress() {
    if (!this.selectedAddressVariable) {
      replaceSelectionWithAddress(
        this.controller,
        this.intl.t('location-plugin.default-label', {
          locale: this.documentLanguage,
        }),
      );
    }
    this.modalOpen = true;
  }

  @action
  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  @action
  setAddressToInsert(address: Address) {
    this.addressToInsert = address;
  }

  @action
  setAddress() {
    if (this.selectedAddressVariable && this.addressToInsert) {
      const { pos } = this.selectedAddressVariable;
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'value', this.addressToInsert);
      });
      this.modalOpen = false;
    }
  }

  <template>
    <li class='au-c-list__item' ...attributes>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        {{on 'click' this.insertOrEditAddress}}
        @disabled={{not this.canInsertAddress}}
      >
        {{#if this.selectedAddressVariable}}
          {{t 'location-plugin.modal.edit'}}
        {{else}}
          {{t 'location-plugin.modal.insert'}}
        {{/if}}
      </AuButton>
    </li>
    <AuModal
      @modalOpen={{this.modalOpen}}
      @closeModal={{this.closeModal}}
      @title={{this.modalTitle}}
      as |modal|
    >
      <modal.Body>
        <LocationMap @address={{this.addressToInsert}} />
        <Edit
          @selectedAddressVariable={{this.selectedAddressVariable}}
          @setAddressToInsert={{this.setAddressToInsert}}
          @setIsLoading={{this.setIsLoading}}
          @defaultMunicipality={{@defaultMunicipality}}
        />
      </modal.Body>
      <modal.Footer>
        <AuButton
          @disabled={{(not this.addressToInsert)}}
          {{on 'click' this.setAddress}}
        >
          {{#if this.isLoading}}
            <AuLoader @hideMessage={{true}} @inline={{true}}>
              {{t 'common.search.loading'}}
            </AuLoader>
          {{else}}
            {{t 'location-plugin.modal.confirm'}}
          {{/if}}
        </AuButton>
      </modal.Footer>
    </AuModal>
  </template>
}
