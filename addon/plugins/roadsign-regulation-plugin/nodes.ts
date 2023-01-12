import { getRdfaAttrs, NodeSpec, rdfaAttrs } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  EXT,
  MOBILITEIT,
  PROV,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export const roadsign_regulation: NodeSpec = {
  content: 'block+',
  group: 'block',
  attrs: {
    ...rdfaAttrs,
    resourceUri: {},
    measureUri: {},
    zonality: {},
    temporal: {},
  },
  toDOM(node) {
    const { resourceUri, measureUri, zonality, temporal } = node.attrs;
    return [
      'div',
      {
        property: MOBILITEIT('heeftVerkeersmaatregel'),
        typeof: MOBILITEIT('Mobiliteitsmaatregel'),
        resource: resourceUri as string,
      },
      [
        'span',
        {
          style: 'display:none;',
          property: PROV('wasDerivedFrom'),
          resource: measureUri as string,
        },
      ],
      [
        'span',
        {
          style: 'display:none;',
          property: EXT('zonality'),
          resource: zonality as string,
        },
      ],
      [
        'span',
        {
          style: 'display:none;',
          property: EXT('temporal'),
          resource: (temporal as string | false).toString(),
        },
      ],
      ['div', { property: DCT('description') }, 0],
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(node: HTMLElement) {
        if (
          hasRDFaAttribute(node, 'typeof', MOBILITEIT('Mobiliteitsmaatregel'))
        ) {
          const resourceUri = node.getAttribute('resource');
          const measureUri = node
            .querySelector(
              `span[property~='${PROV('wasDerivedFrom').prefixed}'],
             span[property~='${PROV('wasDerivedFrom').full}']`
            )
            ?.getAttribute('resource');
          const zonality = node
            .querySelector(
              `span[property~='${EXT('zonality').prefixed}'],
           span[property~='${EXT('zonality').full}']`
            )
            ?.getAttribute('resource');
          const temporal = node
            .querySelector(
              `span[property~='${EXT('temporal').prefixed}'],
           span[property~='${EXT('temporal').full}']`
            )
            ?.getAttribute('value');
          return {
            resourceUri,
            measureUri,
            zonality,
            temporal,
            ...getRdfaAttrs(node),
          };
        }
        return false;
      },
    },
  ],
};
