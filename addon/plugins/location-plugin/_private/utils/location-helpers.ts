import { Address } from './address-helpers';
import { Area, Place } from './geo-helpers';

// For 2 addresses that are the same, the belgianAddressUri will be the same, regardless of how they were created
export function getLocationUri(location: Address | Place | Area) {
  if ('belgianAddressUri' in location) {
    return location.belgianAddressUri;
  } else {
    return location.uri;
  }
}
