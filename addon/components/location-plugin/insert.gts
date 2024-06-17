import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import not from 'ember-truth-helpers/helpers/not';
import IntlService from 'ember-intl/services/intl';
import t from 'ember-intl/helpers/t';
import { trackedReset } from 'tracked-toolbox';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import {
  convertWGS84CoordsToLambert,
  GeoPos,
  type GlobalCoordinates,
  Place,
  Point,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { replaceSelectionWithAddress } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/node-utils';
import { type LocationPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import { NodeContentsUtils } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node-contents';
import Edit from './edit';
import LocationMap, { type LocationType } from './map';

export type CurrentLocation = Address | GlobalCoordinates | undefined;

interface Signature {
  Args: {
    controller: SayController;
    config: LocationPluginConfig;
    defaultMunicipality?: string;
  };
  Element: HTMLLIElement;
}

export default class LocationPluginInsertComponent extends Component<Signature> {
  @service declare intl: IntlService;
  @tracked modalOpen = false;
  @tracked chosenPoint: GeoPos | undefined;
  @tracked isLoading = false;

  @trackedReset({
    memo: 'selectedLocationNode',
    update(component: LocationPluginInsertComponent) {
      const currentLocation = component.selectedLocationNode?.value.attrs
        .value as Address | Place | null;
      return currentLocation instanceof Address ? currentLocation : undefined;
    },
  })
  addressToInsert?: Address;

  @trackedReset({
    memo: 'selectedLocationNode',
    update(component: LocationPluginInsertComponent) {
      const currentLocation = component.selectedLocationNode?.value.attrs
        .value as Address | Place | null;
      return currentLocation instanceof Place
        ? currentLocation.location.location
        : undefined;
    },
  })
  savedLocation: GeoPos | undefined;

  @trackedReset({
    memo: 'selectedLocationNode',
    update(component: LocationPluginInsertComponent) {
      const currentLocation = component.selectedLocationNode?.value.attrs
        .value as Address | Place | null;
      return currentLocation instanceof Place ? currentLocation.name : '';
    },
  })
  placeName: string = '';

  @trackedReset({
    memo: 'selectedLocationNode',
    update(component: LocationPluginInsertComponent) {
      const currentLocation = component.selectedLocationNode?.value.attrs
        .value as Address | Place | null;
      return currentLocation instanceof Place ? 'place' : 'address';
    },
  })
  locationType: LocationType = 'address';

  @trackedReset({
    memo: 'controller.activeEditorState',
    update(component: LocationPluginInsertComponent) {
      const { selection, schema } = component.controller.activeEditorState;
      if (
        selection instanceof NodeSelection &&
        selection.node.type === schema.nodes.oslo_location
      ) {
        return { value: selection.node, pos: selection.from };
      }
      return null;
    },
  })
  selectedLocationNode: ResolvedPNode | null = null;

  get controller() {
    return this.args.controller;
  }

  get nodeContentsUtils() {
    return new NodeContentsUtils(this.args.config);
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get modalTitle() {
    return this.selectedLocationNode
      ? this.intl.t('location-plugin.modal.edit')
      : this.intl.t('location-plugin.modal.insert');
  }

  get canInsert() {
    return !!this.controller.activeEditorView.props.nodeViews?.oslo_location;
  }

  get disableConfirm() {
    if (this.locationType === 'place') {
      return !this.selectedLocationNode || !this.placeName || !this.chosenPoint;
    } else {
      return !this.selectedLocationNode || !this.addressToInsert;
    }
  }

  @action
  setLocationType(type: LocationType) {
    this.locationType = type;
  }

  @action
  setChosenPoint(point: GlobalCoordinates) {
    this.chosenPoint = {
      lambert: convertWGS84CoordsToLambert(point),
      global: point,
    };
  }

  @action
  setPlaceName(name: string) {
    this.placeName = name;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  @action
  insertOrEditAddress() {
    if (!this.selectedLocationNode) {
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
  confirmLocation() {
    if (this.selectedLocationNode) {
      let toInsert: Address | Place | undefined;
      const { pos } = this.selectedLocationNode;
      if (this.locationType === 'address' && this.addressToInsert) {
        toInsert = this.addressToInsert;
        this.controller.withTransaction((tr) => {
          return tr.setNodeAttribute(pos, 'value', toInsert);
        });
        this.modalOpen = false;
      } else if (
        this.locationType === 'place' &&
        this.chosenPoint?.global &&
        this.placeName
      ) {
        toInsert = new Place({
          uri: this.nodeContentsUtils.fallbackPlaceUri(),
          name: this.placeName,
          location: new Point({
            uri: this.nodeContentsUtils.fallbackPointUri(),
            location: {
              lambert: convertWGS84CoordsToLambert(this.chosenPoint.global),
              global: this.chosenPoint?.global,
            },
          }),
        });
        this.controller.withTransaction((tr) => {
          return tr.setNodeAttribute(pos, 'value', toInsert);
        });
        this.modalOpen = false;
        this.chosenPoint = undefined;
      }
    }
  }

  <template>
    <li class='au-c-list__item' ...attributes>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        {{on 'click' this.insertOrEditAddress}}
        @disabled={{not this.canInsert}}
      >
        {{#if this.selectedLocationNode}}
          {{t 'location-plugin.modal.edit'}}
        {{else}}
          {{t 'location-plugin.modal.insert'}}
        {{/if}}
      </AuButton>
    </li>
    <AuModal
      class='location-modal'
      @modalOpen={{this.modalOpen}}
      @closeModal={{this.closeModal}}
      @title={{this.modalTitle}}
      @size='large'
      as |modal|
    >
      <modal.Body>
        <div class='au-o-grid au-o-grid--tiny'>
          <div class='edit-form au-o-grid__item au-u-1-2@small'>
            <Edit
              @locationType={{this.locationType}}
              @setLocationType={{this.setLocationType}}
              @selectedLocationNode={{this.selectedLocationNode}}
              @setAddressToInsert={{this.setAddressToInsert}}
              @setIsLoading={{this.setIsLoading}}
              @defaultMunicipality={{@defaultMunicipality}}
              @placeName={{this.placeName}}
              @setPlaceName={{this.setPlaceName}}
              @nodeContentsUtils={{this.nodeContentsUtils}}
            />
          </div>
          <LocationMap
            class='au-o-grid__item au-u-1-2@small au-o-box-large'
            @address={{this.addressToInsert}}
            @locationType={{this.locationType}}
            @location={{this.chosenPoint}}
            @existingLocation={{this.savedLocation}}
            @setLocation={{this.setChosenPoint}}
          />
        </div>
      </modal.Body>
      <modal.Footer>
        <AuButton
          @disabled={{this.disableConfirm}}
          {{on 'click' this.confirmLocation}}
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
