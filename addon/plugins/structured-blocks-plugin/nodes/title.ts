import {
  NodeSpec,
  NodeView,
  PNode,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

import { createStructureConfig } from './config';
import { html } from 'common-tags';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  const config = createStructureConfig('title');
  return {
    ...config,
    toDOM: (node) => [
      'div',
      {
        property: config.name,
      },
      ['h1', node.attrs.text],
      ['div', 0],
    ],
    parseDOM: [
      {
        tag: 'div h1',
        getAttrs(element: HTMLElement) {
          if (element.parentElement?.getAttribute('property') === config.name) {
            return { text: element.innerText };
          } else {
            return false;
          }
        },
      },
    ],
  };
};
export const title = createEmberNodeSpec(emberNodeConfig());

// export const title: NodeSpec = {
//   inline: false,
//   isolating: true,
//   selectable: false,
//   draggable: false,
//   defining: true,
//   attrs: {
//     text: {
//       default: '',
//     },
//   },
//
//   group: 'structure block',
//   content: 'block+',
//   toDOM: (node) => [
//     'div',
//     {
//       property: 'title',
//     },
//     ['h1', node.attrs.text],
//     ['div', 0],
//   ],
//   parseDOM: [
//     {
//       tag: 'div h1',
//       getAttrs(element: HTMLElement) {
//         if (element.parentElement?.getAttribute('property') === 'title') {
//           return { text: element.innerText };
//         } else {
//           return false;
//         }
//       },
//     },
//   ],
// };

export const titleView = createEmberNodeView(emberNodeConfig());

const headerTemplate = html`
  <div>
    <div class="au-u-flex au-u-flex--no-wrap">
      <button type="button">+</button>
      <div
        class="au-u-padding-right-small au-u-padding-top-small au-u-bold au-u-text-right prefix-text"
      >
        <h1>Title</h1>
      </div>
      <div class="au-u-flex fill-flex">
        <input type="text" class="full-length" />
      </div>
    </div>
    <div
      class="au-u-11-12 border au-c-textarea content-area"
      id="contentDOM"
    ></div>
  </div>
`;
const domParser = new DOMParser();
const compiledHeaderTemplate = unwrap(
  domParser.parseFromString(headerTemplate, 'text/html').body.firstElementChild
) as HTMLElement;

class TitleView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;

  constructor() {
    this.dom = compiledHeaderTemplate;
    this.contentDOM = unwrap(
      this.dom.querySelector('#contentDOM')
    ) as HTMLElement;
  }
}
