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
  Area,
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

function updateFromNode<T extends Address | Place | Area, R>(
  Class: new (...args: unknown[]) => T,
  extractFunc: (current: T) => R,
  defaultValue?: R,
) {
  return (component: LocationPluginInsertComponent): R | undefined => {
    const curLocation = component.selectedLocationNode?.value.attrs.value as
      | Address
      | Area
      | Place
      | null;
    return curLocation instanceof Class
      ? extractFunc(curLocation)
      : defaultValue;
  };
}

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
    update: updateFromNode(Address, (address) => address),
  })
  addressToInsert?: Address;

  @trackedReset({
    memo: 'selectedLocationNode',
    update: updateFromNode(Place, (place) => place.location.location),
  })
  savedLocation: GeoPos | undefined;

  @trackedReset({
    memo: 'selectedLocationNode',
    update(component: LocationPluginInsertComponent) {
      return (
        updateFromNode(Place, (place) => place.name)(component) ??
        updateFromNode(Area, (area) => area.name, '')(component)
      );
    },
  })
  placeName: string = '';

  @trackedReset({
    memo: 'selectedLocationNode',
    update: updateFromNode(Area, (area) => area.locations),
  })
  savedArea: GeoPos[] | undefined;

  @trackedReset({
    memo: 'selectedLocationNode',
    update(component: LocationPluginInsertComponent) {
      return (
        updateFromNode(Place, () => 'place')(component) ??
        updateFromNode(Area, () => 'area', 'address')(component)
      );
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
    switch (this.locationType) {
      case 'place':
        return (
          !this.selectedLocationNode || !this.placeName || !this.chosenPoint
        );
      case 'address':
        return !this.selectedLocationNode || !this.addressToInsert;
      default:
        return !this.selectedLocationNode || !this.placeName || !this.savedArea;
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
    this.addressToInsert = undefined;
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
  setArea(vertices: GlobalCoordinates[]) {
    this.savedArea = vertices.map((vertex) => ({
      global: vertex,
      lambert: convertWGS84CoordsToLambert(vertex),
    }));
  }

  @action
  confirmLocation() {
    if (this.selectedLocationNode) {
      let toInsert: Address | Place | Area | undefined;
      const { pos } = this.selectedLocationNode;
      if (this.locationType === 'address' && this.addressToInsert) {
        toInsert = this.addressToInsert;
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
        this.chosenPoint = undefined;
      } else if (
        this.locationType === 'area' &&
        this.savedArea &&
        this.placeName
      ) {
        toInsert = new Area({
          uri: this.nodeContentsUtils.fallbackPlaceUri(),
          name: this.placeName,
          locations: this.savedArea,
        });
      }
      if (toInsert) {
        this.controller.withTransaction((tr) => {
          return tr.setNodeAttribute(pos, 'value', toInsert);
        });
        this.modalOpen = false;
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
            @existingArea={{this.savedArea}}
            @setArea={{this.setArea}}
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
