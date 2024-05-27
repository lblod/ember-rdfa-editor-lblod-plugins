import Component from '@glimmer/component';
import { localCopy } from 'tracked-toolbox';
import { LeafletMap } from 'ember-leaflet';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';

const COORD_SYSTEM_CENTER = {
  lng: 4.450822554431,
  lat: 50.50526730529,
};

interface Signature {
  Args: {
    address: Address | undefined;
  };
  Element: HTMLLIElement;
}

export default class LocationPluginMapComponent extends Component<Signature> {
  @localCopy('args.address') address: Address | undefined;

  get addressLatLng() {
    return this.address?.location.global ?? COORD_SYSTEM_CENTER;
  }
  get zoom() {
    return this.address?.location ? 20 : 7;
  }

  <template>
    {{! template-lint-disable no-inline-styles }}
    <div style='height:300px'>
      <LeafletMap
        @center={{this.addressLatLng}}
        @zoom={{this.zoom}}
        as |layers|
      >
        <layers.tile
          @url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        />
        <layers.marker
          @location={{this.addressLatLng}}
          @opacity={{0.4}}
          as |marker|
        >
          {{! template-lint-disable no-bare-strings }}
          <marker.popup>
            Main location
          </marker.popup>
        </layers.marker>
      </LeafletMap>
    </div>
  </template>
}
