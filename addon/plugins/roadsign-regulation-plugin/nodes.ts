import {
  getRdfaAttrs,
  NodeSpec,
  rdfaAttrSpec,
  PNode,
} from '@lblod/ember-rdfa-editor';
import {
  DCT,
  EXT,
  MOBILITEIT,
  PROV,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

const CONTENT_SELECTOR = `div[property~='${
  DCT('description').full
}'],div[property~='${DCT('description').prefixed}']`;

export const roadsign_regulation: NodeSpec = {
  content: 'block+',
  group: 'block',
  attrs: {
    ...rdfaAttrSpec({ rdfaAware: false }),
    resourceUri: {},
    measureUri: {},
    zonality: {},
    temporal: {
      default: false,
    },
  },
  classNames: ['say-roadsign-regulation'],
  toDOM(node: PNode) {
    const { resourceUri, measureUri, zonality, temporal } = node.attrs;
    return [
      'div',
      {
        property: MOBILITEIT('heeftVerkeersmaatregel'),
        typeof: MOBILITEIT('Mobiliteitsmaatregel'),
        resource: resourceUri as string,
        class: getClassnamesFromNode(node),
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
          property: EXT('temporal'),
          resource: (temporal as string) ?? false,
        },
      ],
      ['div', { property: DCT('description') }, 0],
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      node: 'block_rdfa',
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node, { rdfaAware: true });
        if (!attrs || attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        if (
          hasRDFaAttribute(
            node,
            'typeof',
            MOBILITEIT('Mobiliteitsmaatregel'),
          ) &&
          node.querySelector(CONTENT_SELECTOR)
        ) {
          const resourceUri = node.getAttribute('resource');
          const measureConceptUri = node
            .querySelector(
              `span[property~='${PROV('wasDerivedFrom').prefixed}'],
             span[property~='${PROV('wasDerivedFrom').full}']`,
            )
            ?.getAttribute('resource');
          const zonality = node
            .querySelector(
              `span[property~='${EXT('zonality').prefixed}'],
           span[property~='${EXT('zonality').full}']`,
            )
            ?.getAttribute('resource');
          if (!resourceUri || !measureConceptUri || !zonality) {
            return false;
          }
          const { rdfaNodeType, properties, backlinks, __rdfaId } = attrs;
          // We need to ensure that a content-literal for the description is added
          const propertiesFiltered = properties.filter(
            (prop) => !DCT('description').matches(prop.predicate),
          );
          propertiesFiltered.push({
            predicate: DCT('description').full,
            object: sayDataFactory.contentLiteral(),
          });
          return {
            rdfaNodeType,
            __rdfaId,
            properties: propertiesFiltered,
            backlinks,
            label: `Mobiliteitsmaatregel`,
          };
        }
        return false;
      },
      contentElement: CONTENT_SELECTOR,
    },
  ],
};
