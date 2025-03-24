import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { fn } from '@ember/helper';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';
import t from 'ember-intl/helpers/t';
import {
  Leaflet,
  LeafletMap,
  type LeafletMapSig,
  type LeafletMapStart,
} from 'ember-leaflet';
import { type LatLngBoundsExpression } from 'leaflet';
import { type LeafletMouseEvent } from 'leaflet';
import { trackedReset } from 'tracked-toolbox';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import {
  convertLambertCoordsToWGS84,
  GeoPos,
  type GlobalCoordinates,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';

// Taken from Leaflet's default icon, with the viewbox tweaked (from 0 0 500 820), so that the icon
// is a whole number of pixels in size, to make positioning the point easy.
const ICON_HTML = `<svg viewBox="0 0 500 800" version="1.1" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"
     style="fill-rule: evenodd; clip-rule: evenodd; stroke-linecap: round;">
    <defs>
        <linearGradient x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(2.30025e-15,-37.566,37.566,2.30025e-15,416.455,540.999)" id="map-marker-38-f">
            <stop offset="0" stop-color="rgb(18,111,198)"/>
            <stop offset="1" stop-color="rgb(76,156,209)"/>
        </linearGradient>
        <linearGradient x1="0" y1="0" x2="1" y2="0"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="matrix(1.16666e-15,-19.053,19.053,1.16666e-15,414.482,522.486)"
                        id="map-marker-38-s">
            <stop offset="0" stop-color="rgb(46,108,151)"/>
            <stop offset="1" stop-color="rgb(56,131,183)"/>
        </linearGradient>
    </defs>
    <g transform="matrix(19.5417,0,0,19.5417,-7889.1,-9807.44)">
        <path fill="#FFFFFF" d="M421.2,515.5c0,2.6-2.1,4.7-4.7,4.7c-2.6,0-4.7-2.1-4.7-4.7c0-2.6,2.1-4.7,4.7-4.7 C419.1,510.8,421.2,512.9,421.2,515.5z"/>
        <path d="M416.544,503.612C409.971,503.612 404.5,509.303 404.5,515.478C404.5,518.256 406.064,521.786 407.194,524.224L416.5,542.096L425.762,524.224C426.892,521.786 428.5,518.433 428.5,515.478C428.5,509.303 423.117,503.612 416.544,503.612ZM416.544,510.767C419.128,510.784 421.223,512.889 421.223,515.477C421.223,518.065 419.128,520.14 416.544,520.156C413.96,520.139 411.865,518.066 411.865,515.477C411.865,512.889 413.96,510.784 416.544,510.767Z" stroke-width="1.1px" fill="url(#map-marker-38-f)" stroke="url(#map-marker-38-s)"/>
    </g>
</svg>`;
// We use Leaflet.divIcon directly, as passing arguments to the ember-leaflet helper seems to be
// broken
const MARKER_ICON = Leaflet.divIcon({
  html: ICON_HTML,
  // This prevents the default class from being applied, along with the default styling
  className: '',
  iconAnchor: [15, 48],
  iconSize: [30, 48],
});

export const SUPPORTED_LOCATION_TYPES = ['address', 'place', 'area'] as const;
export type LocationType = (typeof SUPPORTED_LOCATION_TYPES)[number];

const MAP_TILE_ATTRIBUTION =
  '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const COORD_SYSTEM_CENTER: GlobalCoordinates = {
  lng: 4.450822554431,
  lat: 50.50526730529,
};
const COORD_SYSTEM_START = {
  center: COORD_SYSTEM_CENTER,
  zoom: 7,
};

function isLast(array: unknown[], index: number) {
  return array.length === index + 1;
}
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
    existingArea?: GeoPos[];
    setArea: (vertices: GlobalCoordinates[]) => void;
  };
  Element: HTMLElement;
}

function ensureGlobalCoordinates(geoPos: GeoPos) {
  return geoPos.global || convertLambertCoordsToWGS84(geoPos.lambert);
}
function areaLocations(
  locationType: LocationType,
  positions: GeoPos[] | undefined,
) {
  return locationType === 'area' && positions?.length !== 0
    ? positions?.map((pos) => ensureGlobalCoordinates(pos))
    : undefined;
}

/** Find the southWest and northEast corners bounding an arbitrary set of points */
function generateBoundsFromShape(
  areaForBounds: GeoPos[] | undefined,
): LatLngBoundsExpression | undefined {
  if (areaForBounds && areaForBounds.length !== 0) {
    const southWest = { ...ensureGlobalCoordinates(areaForBounds[0]) };
    const northEast = { ...ensureGlobalCoordinates(areaForBounds[0]) };
    areaForBounds.forEach((pos) => {
      const vertex = ensureGlobalCoordinates(pos);
      if (vertex.lat < southWest.lat) {
        southWest.lat = vertex.lat;
      } else if (vertex.lat > northEast.lat) {
        northEast.lat = vertex.lat;
      }
      if (vertex.lng < southWest.lng) {
        southWest.lng = vertex.lng;
      } else if (vertex.lng > northEast.lng) {
        northEast.lng = vertex.lng;
      }
    });
    return [
      [southWest.lat, southWest.lng],
      [northEast.lat, northEast.lng],
    ];
  }
  return undefined;
}

type MapWrapperSig = {
  Args: Omit<
    LeafletMapSig['Args'],
    'bounds' | 'center' | 'zoom' | 'lat' | 'lng'
  > & {
    mapStart: LeafletMapStart;
  };
  Blocks: LeafletMapSig['Blocks'];
};

/**
 * LeafletMap doesn't handle undefined being passed for the bounds argument, so we use a wrapper
 * component to make sure only to pass the relevant args
 */
class MapWrapper extends Component<MapWrapperSig> {
  get unwrappedBounds() {
    return 'bounds' in this.args.mapStart ? this.args.mapStart.bounds : false;
  }
  get isOrigin() {
    return (
      'center' in this.args.mapStart &&
      this.args.mapStart.center === COORD_SYSTEM_CENTER
    );
  }
  get unwrappedCenter() {
    return 'center' in this.args.mapStart
      ? {
          center: this.args.mapStart.center,
          zoom: this.args.mapStart.zoom,
        }
      : false;
  }
  get unwrappedLatLng() {
    return 'lat' in this.args.mapStart
      ? {
          lat: this.args.mapStart.lat,
          lng: this.args.mapStart.lng,
          zoom: this.args.mapStart.zoom,
        }
      : false;
  }
  <template>
    {{#if this.unwrappedBounds}}
      <LeafletMap
        @bounds={{this.unwrappedBounds}}
        @onClick={{@onClick}}
        as |layers|
      >
        {{yield layers}}
      </LeafletMap>
    {{else if this.isOrigin}}
      {{! If we're at the default center, use hard-coded values to avoid map jumps }}
      <LeafletMap
        @center={{COORD_SYSTEM_CENTER}}
        @zoom={{7}}
        @onClick={{@onClick}}
        as |layers|
      >
        {{yield layers}}
      </LeafletMap>
    {{else if this.unwrappedCenter}}
      <LeafletMap
        @center={{this.unwrappedCenter.center}}
        @zoom={{this.unwrappedCenter.zoom}}
        @onClick={{@onClick}}
        as |layers|
      >
        {{yield layers}}
      </LeafletMap>
    {{else if this.unwrappedLatLng}}
      <LeafletMap
        @lat={{this.unwrappedLatLng.lat}}
        @lng={{this.unwrappedLatLng.lng}}
        @zoom={{this.unwrappedLatLng.zoom}}
        @onClick={{@onClick}}
        as |layers|
      >
        {{yield layers}}
      </LeafletMap>
    {{/if}}
  </template>
}

export default class LocationPluginMapComponent extends Component<Signature> {
  @tracked vertices: GlobalCoordinates[] = [];

  // Use untracked properties as otherwise the map jumps to any area or location we pick
  existingAreaBounds = generateBoundsFromShape(this.args.existingArea);
  existingLocationCoords = this.args.existingLocation
    ? ensureGlobalCoordinates(this.args.existingLocation)
    : undefined;

  @trackedReset({
    memo(component: LocationPluginMapComponent) {
      return (
        component.args.address ||
        component.args.existingLocation ||
        component.existingAreaBounds
      );
    },
    update(component: LocationPluginMapComponent) {
      if (component.args.address) {
        return {
          center: ensureGlobalCoordinates(
            component.args.address.location.location,
          ),
          zoom: 18,
        };
      } else if (component.args.existingLocation) {
        return {
          center: ensureGlobalCoordinates(component.args.existingLocation),
          zoom: 18,
        };
      } else if (component.existingAreaBounds) {
        return {
          bounds: component.existingAreaBounds,
        };
      } else {
        return COORD_SYSTEM_START;
      }
    },
  })
  mapLocation: LeafletMapStart = COORD_SYSTEM_START;

  get foundAddress() {
    return 'center' in this.mapLocation ? this.mapLocation.center : false;
  }

  @action
  onMapClick(event: LeafletMouseEvent) {
    if (this.args.locationType === 'place') {
      this.args.setLocation(event.latlng);
    } else if (this.args.locationType === 'area') {
      this.vertices = [...this.vertices, event.latlng];
    }
  }

  @action
  onVertexClick(index: number) {
    if (index + 1 === this.vertices.length) {
      // Last vertex, click to remove
      this.vertices = this.vertices.slice(0, -1);
    } else if (index === 0) {
      // First vertex, click to end
      this.args.setArea(this.vertices);
      this.vertices = [];
    }
  }

  <template>
    <div
      class='map-wrapper
        {{unless (eq @locationType "address") "map-cursor-pointer"}}'
      ...attributes
    >
      <MapWrapper
        @mapStart={{this.mapLocation}}
        @onClick={{this.onMapClick}}
        as |layers|
      >
        <layers.tile
          @url={{MAP_TILE_URL}}
          @attribution={{MAP_TILE_ATTRIBUTION}}
        />
        {{#if (and @address (eq @locationType 'address') this.foundAddress)}}
          <layers.marker
            @location={{this.foundAddress}}
            @icon={{MARKER_ICON}}
            as |marker|
          >
            <marker.tooltip>
              {{@address.formatted}}
            </marker.tooltip>
          </layers.marker>
        {{/if}}
        {{#if this.existingLocationCoords}}
          <layers.marker
            @opacity={{if @location 0.3 1}}
            @location={{this.existingLocationCoords}}
            @icon={{MARKER_ICON}}
            as |marker|
          >
            <marker.tooltip>
              {{displayLocation @existingLocation}}
            </marker.tooltip>
          </layers.marker>
        {{/if}}
        {{#if (and @location (eq @locationType 'place'))}}
          <layers.marker @location={{@location.global}} @icon={{MARKER_ICON}} />
        {{/if}}
        {{#if (eq @locationType 'area')}}
          <layers.polyline @locations={{this.vertices}} />
          {{#each this.vertices as |vertex index|}}
            <layers.marker
              @location={{vertex}}
              @onClick={{fn this.onVertexClick index}}
              @icon={{MARKER_ICON}}
              as |marker|
            >
              {{#if (eq index 0)}}
                <marker.tooltip>
                  {{t 'location-plugin.map.hint.finish-shape'}}
                </marker.tooltip>
              {{else if (isLast this.vertices index)}}
                <marker.tooltip>
                  {{t 'location-plugin.map.hint.delete-point'}}
                </marker.tooltip>
              {{/if}}
            </layers.marker>
          {{/each}}
        {{/if}}
        {{#if (areaLocations @locationType @existingArea)}}
          <layers.polygon
            @locations={{areaLocations @locationType @existingArea}}
          />
        {{/if}}
      </MapWrapper>
    </div>
  </template>
}
