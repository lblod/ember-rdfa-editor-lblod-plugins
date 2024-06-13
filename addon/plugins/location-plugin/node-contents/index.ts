import { v4 as uuidv4 } from 'uuid';
import { type LocationPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import {
  constructPointSpec,
  parseOldPointElement,
  parsePointElement,
} from './point';
import { constructPlaceSpec, parsePlaceElement } from './place';
import {
  constructAddressSpec,
  parseOldAddressElement,
  parseAddressElement,
} from './address';

export class NodeContentsUtils {
  declare config: LocationPluginConfig;
  constructor(config: LocationPluginConfig) {
    this.config = config;
  }

  fallbackPointUri = () => `${this.config.defaultPointUriRoot}${uuidv4()}`;
  point = {
    construct: constructPointSpec,
    parseOld: parseOldPointElement(this),
    parse: parsePointElement(this),
  };

  fallbackPlaceUri = () => `${this.config.defaultPlaceUriRoot}${uuidv4()}`;
  place = {
    construct: constructPlaceSpec,
    parse: parsePlaceElement(this),
  };

  fallbackAddressUri = () => `${this.config.defaultAddressUriRoot}${uuidv4()}`;
  address = {
    construct: constructAddressSpec,
    parseOld: parseOldAddressElement(this),
    parse: parseAddressElement(this),
  };
}
