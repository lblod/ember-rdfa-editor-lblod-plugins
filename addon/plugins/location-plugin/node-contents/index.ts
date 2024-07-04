import { v4 as uuidv4 } from 'uuid';
import { type LocationPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import {
  constructGeometrySpec,
  parseGeometryElement,
  parseOldPointElement,
} from './point';
import { constructPlaceSpec, parsePlaceElement } from './place';
import {
  constructAddressSpec,
  parseOldAddressElement,
  parseAddressElement,
} from './address';
import { constructAreaSpec, parseAreaElement } from './area';

export class NodeContentsUtils {
  declare config: LocationPluginConfig;
  constructor(config: LocationPluginConfig) {
    this.config = config;
  }

  fallbackGeometryUri = () => `${this.config.defaultPointUriRoot}${uuidv4()}`;
  geometry = {
    construct: constructGeometrySpec,
    parseOldPoint: parseOldPointElement(this),
    parse: parseGeometryElement(this),
  };

  fallbackPlaceUri = () => `${this.config.defaultPlaceUriRoot}${uuidv4()}`;
  place = {
    construct: constructPlaceSpec,
    parse: parsePlaceElement(this),
  };

  area = {
    construct: constructAreaSpec,
    parse: parseAreaElement(this),
  };

  fallbackAddressUri = () => `${this.config.defaultAddressUriRoot}${uuidv4()}`;
  address = {
    construct: constructAddressSpec,
    parseOld: parseOldAddressElement(this),
    parse: parseAddressElement(this),
  };
}
