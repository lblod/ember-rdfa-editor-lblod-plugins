import {
  ADRES,
  ADRES_TYPO,
  DCT,
  EXT,
  LOCN,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findChildWithRdfaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import { Point } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { constructGeometrySpec } from './point';
import { type NodeContentsUtils } from './';

export const constructAddressSpec = (address: Address) => {
  const streetNode = span(
    {
      property: LOCN('thoroughfare').full,
    },
    address.street,
  );
  const housenumberNode =
    address.housenumber &&
    span(
      { property: ADRES('Adresvoorstelling.huisnummer').full },
      address.housenumber,
    );
  const busnumberNode =
    address.busnumber &&
    span(
      { property: ADRES('Adresvoorstelling.busnummer').full },
      address.busnumber,
    );
  const zipcodeNode = address.truncated
    ? span({
        property: LOCN('postcode').full,
        content: address.zipcode,
      })
    : span(
        {
          property: LOCN('postcode').full,
        },
        address.zipcode,
      );
  const municipalityNode = address.truncated
    ? span({
        property: ADRES('gemeentenaam').full,
        language: 'nl',
        content: address.municipality,
      })
    : span(
        {
          property: ADRES('gemeentenaam').full,
          language: 'nl',
        },
        address.municipality,
      );
  const belgianUriNode =
    address.belgianAddressUri &&
    span({
      property: ADRES('verwijstNaar').full,
      resource: address.belgianAddressUri,
    });
  const truncatedNode = span({
    property: EXT('truncated').full,
    content: address.truncated,
  });

  return span(
    { resource: address.uri, typeof: LOCN('Address').full },
    streetNode,
    ...(housenumberNode ? [' ', housenumberNode] : []),
    ...(busnumberNode ? [' bus ', busnumberNode] : []),
    address.truncated ? '' : ', ',
    zipcodeNode,
    address.truncated ? '' : ' ',
    municipalityNode,
    ...(belgianUriNode ? [belgianUriNode] : []),
    truncatedNode,
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
        truncated: false,
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
    const belgianAddressNode = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES('verwijstNaar'),
    );
    // In the past this was stored as a string relationship, which matches the example in the model
    // docs but not the diagram, so look for either here
    const belgianAddressUri =
      belgianAddressNode?.getAttribute('resource') ??
      belgianAddressNode?.getAttribute('content') ??
      undefined;
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
    const zipCodeNode = findChildWithRdfaAttribute(
      addressNode,
      'property',
      LOCN('postcode'),
    );
    const zipcode =
      zipCodeNode?.getAttribute('content') ?? zipCodeNode?.textContent;
    const municipalityNode = findChildWithRdfaAttribute(
      addressNode,
      'property',
      ADRES('gemeentenaam'),
    );

    const municipality =
      municipalityNode?.getAttribute('content') ??
      municipalityNode?.textContent;

    const truncated =
      findChildWithRdfaAttribute(
        addressNode,
        'property',
        EXT('truncated'),
      )?.getAttribute('content') === 'true';

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
        truncated,
      });
    } else {
      return;
    }
  };
