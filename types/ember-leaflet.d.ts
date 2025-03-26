declare module 'ember-leaflet' {
  import Component from '@glimmer/component';
  import { type WithBoundArgs } from '@glimmer/template';
  import {
    type LatLngBoundsExpression,
    type LatLngExpression,
    type LeafletMouseEventHandlerFn,
    type MapOptions,
    type MarkerOptions,
    type PolylineOptions,
    type PopupOptions,
    type TileLayerOptions,
    type TooltipOptions,
  } from 'leaflet';

  type PointLocation =
    | {
        lat: number;
        lng: number;
      }
    | {
        location: LatLngExpression;
      };
  export type LeafletMapStart =
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
        bounds: LatLngBoundsExpression;
      };

  interface LeafletTileLayerSig {
    Args: {
      parent: unknown;
      url: string;
    } & TileLayerOptions;
    Element: HTMLElement;
  }
  export class LeafletTileLayer extends Component<LeafletTileLayerSig> {}

  interface LeafletPopupSig {
    Args: { parent: unknown } & PopupOptions;
    Blocks: {
      default: [];
    };
    Element: HTMLElement;
  }
  export class LeafletPopup extends Component<LeafletPopupSig> {}

  interface LeafletTooltipSig {
    Args: { parent: unknown } & TooltipOptions;
    Blocks: {
      default: [];
    };
    Element: HTMLElement;
  }
  export class LeafletTooltip extends Component<LeafletTooltipSig> {}

  type InteractiveLayerBlocks = {
    popup: WithBoundArgs<typeof LeafletPopup, 'parent'>;
    tooltip: WithBoundArgs<typeof LeafletTooltip, 'parent'>;
  };

  interface LeafletMarkerSig {
    Args: {
      parent: unknown;
      location: PointLocation;
    } & MarkerOptions;
    Blocks: {
      default: [InteractiveLayerBlocks];
    };
    Element: HTMLElement;
  }
  export class LeafletMarker extends Component<LeafletMarkerSig> {}

  interface LeafletPolylineSig {
    Args: {
      parent: unknown;
      locations: PointLocation[];
    } & PolylineOptions;
    Blocks: {
      default: [InteractiveLayerBlocks];
    };
    Element: HTMLElement;
  }
  export class LeafletPolyline extends Component<LeafletPolylineSig> {}

  interface LeafletPolygonSig {
    Args: {
      parent: unknown;
      locations: PointLocation[];
      // The below is not a mistake, polygons extend polylines and add no options
    } & PolylineOptions;
    Blocks: {
      default: [InteractiveLayerBlocks];
    };
    Element: HTMLElement;
  }
  export class LeafletPolygon extends Component<LeafletPolygonSig> {}

  export interface LeafletMapSig {
    Args: MapOptions &
      LeafletMapStart & {
        /** See leaflet types for more event handlers */
        onClick?: LeafletMouseEventHandlerFn;
      };
    Blocks: {
      default: [
        {
          tile: WithBoundArgs<typeof LeafletTileLayer, 'parent'>;
          marker: WithBoundArgs<typeof LeafletMarker, 'parent'>;
          polyline: WithBoundArgs<typeof LeafletPolyline, 'parent'>;
          polygon: WithBoundArgs<typeof LeafletPolygon, 'parent'>;
        },
      ];
    };
    Element: HTMLDivElement;
  }
  export class LeafletMap extends Component<LeafletMapSig> {}

  export const Leaflet = L;
}
