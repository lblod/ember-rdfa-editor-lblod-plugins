// import {
//   createEmberNodeSpec,
//   createEmberNodeView,
//   EmberNodeConfig,
// } from '@lblod/ember-rdfa-editor/utils/ember-node';

// export const emberNodeConfig: (config) => EmberNodeConfig = (config) => {
//   return {
//     name: 'structure-text',
//     componentPath: 'structured-blocks-plugin/ember-nodes/text',
//     inline: true,
//     group: 'paragraph+',
//     atom: true,
//     attrs: {
//       text: '',
//       // config: {
//       //   default: config,
//       // },
//     },
//     toDOM: (node) => [
//       'div',
//       {
//         property: 'structure-title',
//       },
//       ['h1', node.attrs.text],
//       0,
//     ],
//   };
// };

// export const title = (config) => createEmberNodeSpec(emberNodeConfig(config));
// export const titleView = (config) =>
//   createEmberNodeView(emberNodeConfig(config));
