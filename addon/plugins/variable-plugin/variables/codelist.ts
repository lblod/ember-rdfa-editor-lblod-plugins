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
  getRdfaContentElement,
  RdfaAttrs,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';
import SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import CodelistNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/nodeview';
import {
  Option,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { jsonParse } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { CodeListOption } from '../utils/fetch-data';

export type CodelistAttrs = {
  label: Option<string>;
  source: Option<string>;
  codelist: Option<string>;
  variable: Option<string>;
  variableInstance: Option<string>;
  selectionStyle: Option<string>;
  hardcodedOptionList: Option<CodeListOption[]>;
};

const rdfaAware = true;

const parseDOM: TagParseRule[] = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const attrs = getRdfaAttrs(node, { rdfaAware }) as RdfaAttrs;
      if (!attrs) {
        return false;
      }
      if (
        node.dataset.sayVariable &&
        node.dataset.sayVariableType === 'codelist' &&
        node.dataset.sayNodeVersion === '2'
      ) {
        const label = node.dataset.label;
        const source = node.dataset.source;
        const codelist = node.dataset.codelist;
        const variable = node.dataset.variable;
        const variableInstance = node.dataset.variableInstance;
        const selectionStyle = node.dataset.selectionStyle;
        const hardcodedOptionList = jsonParse(
          node.dataset.optionList,
        ) as Option<CodeListOption[]>;
        return {
          ...attrs,
          label,
          source,
          codelist,
          selectionStyle,
          variable,
          variableInstance,
          hardcodedOptionList,
        } satisfies CodelistAttrs;
      }
      return false;
    },
    getContent: (node: HTMLElement, schema: Schema) => {
      const contentContainer = getRdfaContentElement(node);
      if (!contentContainer) {
        return Fragment.fromArray([]);
      }
      // We only retrieve the `children` here, as it skips the textnodes,
      // we only want the nodes corresponding to `codelist_option` nodes.
      const children = [...contentContainer.children].filter(
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
    variableInstance,
    hardcodedOptionList,
  } = node.attrs;
  const className = humanReadableContent ? '' : ' say-variable';
  const codelist_option_nodes = node.content.content;
  const contentArray = [];
  for (let i = 0; i < codelist_option_nodes.length; i++) {
    const codelist_option_node = codelist_option_nodes[i];
    contentArray.push(
      unwrap(codelist_option_node.type.spec.toDOM)(codelist_option_node),
    );
    if (i !== codelist_option_nodes.length - 1) {
      contentArray.push(', ');
    }
  }
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {
      class: `${getClassnamesFromNode(node)}${className}`,
      'data-say-variable': 'true',
      'data-say-variable-type': 'codelist',
      'data-say-node-version': '2',
      'data-label': label as string | null,
      'data-codelist': codelist as string,
      'data-source': source as string,
      'data-selection-style': selectionStyle as string,
      'data-variable': variable as string,
      'data-variable-instance': variableInstance as string,
      'data-option-list': JSON.stringify(hardcodedOptionList),
    },
    contentArray: contentArray.length ? contentArray : [label],
  });
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
    ...rdfaAttrSpec({ rdfaAware }),
    label: {
      default: null,
    },
    selectionStyle: {
      default: null,
    },
    codelist: {},
    source: {},
    variable: {
      default: null,
    },
    variableInstance: {
      default: null,
    },
    hardcodedOptionList: {
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
  toDOM: (node) => {
    return renderRdfaAware({
      renderable: node,
      attrs: {
        'data-say-type': 'codelist_option',
      },
      tag: 'span',
      content: node.textContent,
    });
  },
};
