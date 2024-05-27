declare module 'ember-leaflet' {
  import Component from '@glimmer/component';
  import { type WithBoundArgs } from '@glimmer/template';
  import {
    type LatLngBounds,
    type LatLngExpression,
    type MapOptions,
    type MarkerOptions,
    type TileLayerOptions,
  } from 'leaflet';

  type PointLocation =
    | {
        lat: number;
        lng: number;
      }
    | {
        location: LatLngExpression;
      };
  type MapStart =
    | {
        lat: number;
        lng: number;
        zoom: number;
      }
    | {
        center: LatLngExpression;
        zoom: number;
      }
    | {
        bounds: LatLngBounds;
      };

  interface LeafletMapSig {
    Args: MapOptions & MapStart;
    Blocks: {
      // default: [{ tile: LeafletTileLayer }];
      default: [
        {
          tile: WithBoundArgs<typeof LeafletTileLayer, 'parent'>;
          marker: WithBoundArgs<typeof LeafletMarker, 'parent'>;
        },
      ];
    };
  }
  export class LeafletMap extends Component<LeafletMapSig> {}

  interface LeafletTileLayerSig {
    Args: {
      parent: unknown;
      url: string;
    } & TileLayerOptions;
    // Blocks: {
    //   default: [];
    // };
    Element: HTMLElement;
  }
  export class LeafletTileLayer extends Component<LeafletTileLayerSig> {}

  interface LeafletMarkerSig {
    Args: {
      parent: unknown;
      location: PointLocation;
    } & MarkerOptions;
    Blocks: {
      default: [
        {
          popup: WithBoundArgs<typeof LeafletMarker, 'parent'>;
        },
      ];
    };
    Element: HTMLElement;
  }
  export class LeafletMarker extends Component<LeafletMarkerSig> {}

  export const Leaflet = L;
  // export const Leaflet = {
  //   Proj: {
  //     CRS: {},
  //   },
  // };
}
