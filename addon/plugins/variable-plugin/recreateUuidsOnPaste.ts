import { v4 as uuidv4 } from 'uuid';
import {
  Fragment,
  Slice,
  Node,
  Schema,
  ProsePlugin,
} from '@lblod/ember-rdfa-editor';

import { recreateUuidsOnPasteKey } from '@lblod/ember-rdfa-editor/plugins/recreateUuidsOnPaste';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

const recreateUuidsOnPaste = new ProsePlugin({
  key: recreateUuidsOnPasteKey,
  props: {
    transformPasted(slice, view) {
      const schema = view.state.schema;
      return new Slice(
        recreateUuidsFromFragment(slice.content, schema),
        slice.openStart,
        slice.openEnd,
      );
    },
  },
});

function recreateUuidsFromFragment(fragment: Fragment, schema: Schema) {
  const newNodes: Node[] = [];

  fragment.forEach((node) => {
    const newNode = recreateUuidsOnNode(node, schema);
    newNodes.push(newNode);
  });

  return Fragment.fromArray(newNodes);
}

function recreateUuidsOnNode(node: Node, schema: Schema) {
  if (node.isText) {
    return node;
  }

  const children: Node[] = [];

  node.content.forEach((node) => {
    const child = recreateUuidsOnNode(node, schema);
    children.push(child);
  });

  const type = node.type;
  const spec = type.spec;

  const uriAttributes = spec['uriAttributes'];

  if (
    !spec['recreateUri'] ||
    !uriAttributes ||
    !Array.isArray(uriAttributes) ||
    !node.attrs['rdfaNodeType']
  ) {
    return schema.node(
      node.type,
      node.attrs,
      Fragment.fromArray(children),
      node.marks,
    );
  }

  const attrs = { ...node.attrs };

  attrs.properties = (attrs.properties as OutgoingTriple[]).map((prop) => {
    if (prop.predicate === EXT('instance').full) {
      return {
        predicate: prop.predicate,
        object: sayDataFactory.namedNode(
          `http://data.lblod.info/variables/${uuidv4()}`,
        ),
      };
    }

    return prop;
  });

  return schema.node(
    node.type,
    attrs,
    Fragment.fromArray(children),
    node.marks,
  );
}

export default recreateUuidsOnPaste;
