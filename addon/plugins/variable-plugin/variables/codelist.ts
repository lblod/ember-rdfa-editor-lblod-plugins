import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  DOMOutputSpec,
  Fragment,
  PNode,
  Schema,
  TagParseRule,
  getRdfaAttrs,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import type { ComponentLike } from '@glint/template';
import {
  RdfaAttrs,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';
import SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import CodelistNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/nodeview';

const rdfaAware = true;

const parseDOM: TagParseRule[] = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      // The parent codelist variable is not an rdfa-aware node
      if (node.dataset['rdfaNodeType']) {
        return false;
      }
      if (
        node.dataset.sayVariable &&
        node.dataset.sayVariableType === 'codelist'
      ) {
        const label = node.dataset.label;
        const source = node.dataset.source;
        const codelist = node.dataset.codelist;
        const variable = node.dataset.variable;
        const selectionStyle = node.dataset.selectionStyle;
        return { label, source, codelist, selectionStyle, variable };
      }
      return false;
    },
    getContent: (node: HTMLElement, schema: Schema) => {
      // We only retrieve the `children` here, as it skips the textnodes,
      // we only want the nodes corresponding to `codelist_option` nodes.
      const children = [...node.children].filter(
        (child: HTMLElement) => child.dataset.sayType === 'codelist_option',
      );
      if (!children.length) {
        return Fragment.empty;
      }

      const contentNodes = children.map((child: HTMLElement) => {
        const attrs = getRdfaAttrs(child, { rdfaAware }) as RdfaAttrs;
        return schema.nodes.codelist_option.create(
          attrs,
          schema.text(child.textContent ?? ''),
        );
      });
      return Fragment.fromArray(contentNodes);
    },
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const {
    label = 'codelist',
    codelist,
    source,
    humanReadableContent,
    selectionStyle,
    variable,
  } = node.attrs;
  const className = humanReadableContent ? '' : ' say-variable';
  const codelist_option_nodes = node.content.content;
  const contentArray = [];
  for (let i = 0; i < codelist_option_nodes.length; i++) {
    const codelist_option_node = codelist_option_nodes[i];
    contentArray.push(
      renderRdfaAware({
        renderable: codelist_option_node,
        attrs: {
          'data-say-type': 'codelist_option',
        },
        tag: 'span',
        content: codelist_option_node.textContent,
      }),
    );
    if (i !== codelist_option_nodes.length - 1) {
      contentArray.push(', ');
    }
  }
  return [
    'span',
    {
      class: `${getClassnamesFromNode(node)}${className}`,
      'data-say-variable': 'true',
      'data-say-variable-type': 'codelist',
      'data-label': label as string | null,
      'data-codelist': codelist as string,
      'data-source': source as string,
      'data-selection-style': selectionStyle as string,
      'data-variable': variable as string,
    },
    ...(contentArray.length ? contentArray : [label]),
  ];
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'codelist',
  component: CodelistNodeviewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'codelist_option*',
  atom: true,
  editable: false,
  recreateUriFunction: recreateVariableUris,
  draggable: false,
  needsFFKludge: true,
  selectable: true,
  attrs: {
    label: {
      default: null,
    },
    selectionStyle: {
      default: 'single',
    },
    codelist: {},
    source: {},
    variable: {
      default: null,
    },
  },
  classNames: ['say-codelist-variable'],
  toDOM,
  parseDOM,
};

export const codelist = createEmberNodeSpec(emberNodeConfig);
export const codelistView = createEmberNodeView(emberNodeConfig);

export const codelist_option: SayNodeSpec = {
  inline: true,
  atom: true,
  content: 'text*',
  selectable: false,
  editable: false,
  draggable: false,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
  },
};
