import { v4 as uuidv4 } from 'uuid';
import {
  ADRES,
  ADRES_TYPO,
  DCT,
  LOCN,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findChildWithRdfaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  contentSpan,
  span,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import { constructPointNode, parseOldPointNode, parsePointNode } from './point';

export const fallbackAddressUri = () =>
  `http://data.lblod.info/id/adresvoorstelling/${uuidv4()}`;

export const constructAddressNode = (address: Address) => {
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
  const idNode = address.uri
    ? [
        span({
          property: ADRES('verwijstNaar').full,
          content: address.uri,
        }),
      ]
    : [];
  // TODO Should dump and use spatial properly, but need to actually link into document...
  return contentSpan(
    { resource: address.uri, typeof: LOCN('Address').full },
    span(
      {
        property: DCT('spatial').full,
      },
      span(
        {
          property: LOCN('thoroughfare').full,
        },
        address.street,
      ),
      ...housenumberNode,
      ...busnumberNode,
    ),
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
    ...idNode,
    constructPointNode(address.location, ADRES('positie')),
  );
};

/** Parse pre-OSLO model rdfaAware address nodes */
export const parseOldAddressNode = (
  addressNode: Element,
): Address | undefined => {
  const uri = addressNode.getAttribute('resource');
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
    findChildWithRdfaAttribute(postInfoNode, 'property', ADRES_TYPO('postcode'))
      ?.textContent;
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
  const location = parseOldPointNode(locationNode);

  if (street && municipality && zipcode && location) {
    return new Address({
      uri: uri ?? fallbackAddressUri(),
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

export const parseAddressNode = (
  addressNode: Element | undefined,
): Address | undefined => {
  if (!addressNode) return undefined;

  const uri = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('verwijstNaar'),
  )?.getAttribute('content');
  const spatialNode = findChildWithRdfaAttribute(
    addressNode,
    'property',
    DCT('spatial'),
  );
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
  const location = parsePointNode(pointNode);

  if (street && municipality && zipcode && location) {
    return new Address({
      uri: uri ?? fallbackAddressUri(),
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
