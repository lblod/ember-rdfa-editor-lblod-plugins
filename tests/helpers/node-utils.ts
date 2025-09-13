import { PNode } from '@lblod/ember-rdfa-editor';
import {
  getOutgoingTriple,
  getOutgoingTripleList,
  Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { findNodesBySubject } from '@lblod/ember-rdfa-editor/plugins/rdfa-info/utils';

export function findNodesOfType(doc: PNode, type: string) {
  const nodes: PNode[] = [];
  doc.descendants((node) => {
    if (node.type.name === type) {
      nodes.push(node);
    }
    return true;
  });
  return nodes;
}

export function getFirstTripleLinkedNodes(
  doc: PNode,
  node: PNode,
  predicate: Resource,
): [Option<OutgoingTriple>, PNode[]] {
  const triple = getOutgoingTriple(node.attrs, predicate);
  if (!triple) return [triple, []];
  const nodes = findNodesBySubject(doc, triple.object.value ?? '');
  return [triple, nodes.map((posNode) => posNode.value)];
}

export function getLinkedNodes(doc: PNode, node: PNode, predicate: Resource) {
  const triples = getOutgoingTripleList(node.attrs, predicate);
  return new Map(
    triples.map((triple: OutgoingTriple) => [
      triple,
      findNodesBySubject(doc, triple.object.value ?? '').map(
        (nodePos) => nodePos.value,
      ),
    ]),
  );
}
