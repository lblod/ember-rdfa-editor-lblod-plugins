import {
  ADRES,
  ADRES_TYPO,
  DCT,
  LOCN,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findChildWithRdfaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import { Point } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { constructGeometrySpec } from './point';
import { type NodeContentsUtils } from './';

export const constructAddressSpec = (address: Address) => {
  const housenumberNode = address.housenumber
    ? [
        ' ',
        span(
          { property: ADRES('Adresvoorstelling.huisnummer').full },
          address.housenumber,
        ),
      ]
    : [];
  const busnumberNode = address.busnumber
    ? [
        ' bus ',
        span(
          { property: ADRES('Adresvoorstelling.busnummer').full },
          address.busnumber,
        ),
      ]
    : [];
  const belgianUriNode = address.belgianAddressUri
    ? [
        span({
          property: ADRES('verwijstNaar').full,
          content: address.belgianAddressUri,
        }),
      ]
    : [];
  return span(
    { resource: address.uri, typeof: LOCN('Address').full },
    span(
      {
        property: LOCN('thoroughfare').full,
      },
      address.street,
    ),
    ...housenumberNode,
    ...busnumberNode,
    ', ',
    span(
      {
        property: LOCN('postcode').full,
      },
      address.zipcode,
    ),
    ' ',
    span(
      {
        property: ADRES('gemeentenaam').full,
        language: 'nl',
      },
      address.municipality,
    ),
    ...belgianUriNode,
    constructGeometrySpec(address.location, ADRES('positie')),
  );
};

/** Parse pre-OSLO model rdfaAware address nodes */
export const parseOldAddressElement =
  (nodeContentsUtils: NodeContentsUtils) =>
  (addressNode: Element): Address | undefined => {
    // Belgian address URI was incorrectly used as the resource URI, so we correct that by
    // generating a new one
    const uri = nodeContentsUtils.fallbackAddressUri();
    const belgianAddressUri = addressNode.getAttribute('resource') ?? undefined;
    const street = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES_TYPO('heeftStraatnaam'),
    )?.textContent;
    const housenumber = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES_TYPO('huisnummer'),
    )?.textContent;
    const busnumber = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES_TYPO('busnummer'),
    )?.textContent;
    const postInfoNode = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES_TYPO('heeftPostinfo'),
    );
    const zipcode =
      postInfoNode &&
      findChildWithRdfaAttribute(
        postInfoNode,
        'property',
        ADRES_TYPO('postcode'),
      )?.textContent;
    const municipality = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES_TYPO('gemeentenaam'),
    )?.textContent;

    const locationNode = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES_TYPO('positie'),
    );
    const location = nodeContentsUtils.geometry.parseOldPoint(locationNode);

    if (street && municipality && zipcode && location) {
      return new Address({
        uri,
        belgianAddressUri,
        street,
        housenumber: housenumber ?? undefined,
        zipcode,
        municipality,
        busnumber: busnumber ?? undefined,
        location,
      });
    } else {
      return;
    }
  };

export const parseAddressElement =
  (nodeContentsUtils: NodeContentsUtils) =>
  (addressNode: Element | undefined): Address | undefined => {
    if (!addressNode) return undefined;

    let uri = addressNode.getAttribute('resource');
    const belgianAddressUri =
      findChildWithRdfaAttribute(
        addressNode,
        'property',
        ADRES('verwijstNaar'),
      )?.getAttribute('content') ?? undefined;
    if (uri === belgianAddressUri) {
      // An older version of this code mistakenly used the belgian address URI as the resource URI,
      // so if they are the same, generate a new one
      uri = nodeContentsUtils.fallbackAddressUri();
    }
    // This node is no longer added, but we keep this lookup for compatibility
    const spatialNode =
      findChildWithRdfaAttribute(addressNode, 'property', DCT('spatial')) ||
      addressNode;
    const street =
      spatialNode &&
      findChildWithRdfaAttribute(spatialNode, 'property', LOCN('thoroughfare'))
        ?.textContent;
    const housenumber =
      spatialNode &&
      findChildWithRdfaAttribute(
        spatialNode,
        'property',
        ADRES('Adresvoorstelling.huisnummer'),
      )?.textContent;
    const busnumber =
      spatialNode &&
      findChildWithRdfaAttribute(
        spatialNode,
        'property',
        ADRES('Adresvoorstelling.busnummer'),
      )?.textContent;
    const zipcode = findChildWithRdfaAttribute(
      addressNode,
      'property',
      LOCN('postcode'),
    )?.textContent;
    const municipality = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES('gemeentenaam'),
    )?.textContent;

    const pointNode = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES('positie'),
    );
    const location = nodeContentsUtils.geometry.parse(pointNode);

    if (street && municipality && zipcode && location instanceof Point) {
      return new Address({
        uri: uri ?? nodeContentsUtils.fallbackAddressUri(),
        belgianAddressUri,
        street,
        housenumber: housenumber ?? undefined,
        zipcode,
        municipality,
        busnumber: busnumber ?? undefined,
        location,
      });
    } else {
      return;
    }
  };
