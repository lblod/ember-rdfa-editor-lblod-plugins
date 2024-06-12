import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';
import t from 'ember-intl/helpers/t';
import { LeafletMap } from 'ember-leaflet';
import { type LeafletMouseEvent } from 'leaflet';
import { restartableTask } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import {
  convertLambertCoordsToWGS84,
  GeoPos,
  type GlobalCoordinates,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';

export type LocationType = 'address' | 'place';

const COORD_SYSTEM_CENTER: GlobalCoordinates = {
  lng: 4.450822554431,
  lat: 50.50526730529,
};

function displayLocation(location: GeoPos | undefined) {
  const { lambert } = location ?? {};
  return lambert
    ? `[x: ${lambert.x.toFixed(2)}, y: ${lambert.y.toFixed(2)}]`
    : '';
}

interface Signature {
  Args: {
    address: Address | undefined;
    locationType: LocationType;
    location?: GeoPos;
    setLocation: (loc: GlobalCoordinates) => void;
    existingLocation?: GeoPos;
  };
  Element: HTMLElement;
}

async function ensureGlobalCoordinates(geoPos: GeoPos) {
  if (geoPos.global) {
    return geoPos.global;
  }
  return await convertLambertCoordsToWGS84(geoPos.lambert);
}

export default class LocationPluginMapComponent extends Component<Signature> {
  @tracked mapCenter = COORD_SYSTEM_CENTER;
  @tracked zoom = 7;
  @tracked existingLocationCoords: GlobalCoordinates | undefined;

  addressLatLngLookup = restartableTask(
    async (): Promise<GlobalCoordinates | undefined> => {
      const { address, existingLocation } = this.args;
      if (address) {
        this.mapCenter = await ensureGlobalCoordinates(
          address.location.location,
        );
        this.zoom = 19;
      } else if (existingLocation) {
        this.mapCenter = await ensureGlobalCoordinates(existingLocation);
        this.existingLocationCoords = this.mapCenter;
        this.zoom = 19;
      }
      return COORD_SYSTEM_CENTER;
    },
  );
  addressLatLng = trackedTask<GlobalCoordinates | undefined>(
    this,
    this.addressLatLngLookup,
    () => [this.args.address, this.args.existingLocation],
  );

  get doRenderMap() {
    return this.addressLatLng.value && this.zoom;
  }

  @action
  onMapClick(event: LeafletMouseEvent) {
    if (this.args.locationType === 'place') {
      this.args.setLocation(event.latlng);
    }
  }

  <template>
    <div class='map-wrapper' ...attributes>
      {{#if this.addressLatLng.isRunning}}
        <AuLoader @hideMessage={{true}}>
          {{t 'common.initialBounds.loading'}}
        </AuLoader>
      {{else if this.addressLatLng.value}}
        <LeafletMap
          @center={{this.mapCenter}}
          @zoom={{this.zoom}}
          @onClick={{this.onMapClick}}
          as |layers|
        >
          <layers.tile
            @url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            @attribution='&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {{#if (and @address (eq @locationType 'address'))}}
            <layers.marker @location={{this.mapCenter}} as |marker|>
              <marker.popup>
                {{@address.formatted}}
              </marker.popup>
            </layers.marker>
          {{/if}}
          {{#if this.existingLocationCoords}}
            <layers.marker
              @opacity={{if @location 0.3 1}}
              @location={{this.existingLocationCoords}}
              as |marker|
            >
              <marker.popup>
                {{displayLocation @existingLocation}}
              </marker.popup>
            </layers.marker>
          {{/if}}
          {{#if (and @location (eq @locationType 'place'))}}
            <layers.marker @location={{@location.global}} />
          {{/if}}
        </LeafletMap>
      {{/if}}
    </div>
  </template>
}
