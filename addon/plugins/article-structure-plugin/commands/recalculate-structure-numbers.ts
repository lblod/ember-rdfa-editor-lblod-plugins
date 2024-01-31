import { PNode, Schema, Transaction } from '@lblod/ember-rdfa-editor';
import { findNodeByRdfaId } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { isRdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
import type { Resource } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { ELI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { StructureSpec } from '..';

function updateNumber(
  transaction: Transaction,
  schema: Schema,
  { attrs }: PNode,
  number: string,
  numberPredicate?: Resource,
) {
  if (isRdfaAttrs(attrs) && attrs.rdfaNodeType === 'resource') {
    const properties = attrs.properties;
    const numberProp = properties.find((prop) =>
      (numberPredicate ?? ELI('number')).matches(prop.predicate),
    );
    const numberRdfaId =
      numberProp?.object.termType === 'LiteralNode' && numberProp.object.value;
    const numberNode =
      numberRdfaId && findNodeByRdfaId(transaction.doc, numberRdfaId);
    if (numberNode) {
      transaction.replaceWith(
        numberNode.pos + 1,
        numberNode.pos + numberNode.value.nodeSize - 1,
        schema.text(number),
      );
    }
  }
}

export default function recalculateStructureNumbers(
  transaction: Transaction,
  schema: Schema,
  ...structureSpecs: StructureSpec[]
) {
  const doc = transaction.doc;
  const indices = new Array<number>(structureSpecs.length).fill(1);
  const contexts: (PNode | null)[] = new Array<PNode | null>(
    structureSpecs.length,
  ).fill(null);
  doc.descendants((node, pos, parent) => {
    structureSpecs.forEach((spec, i) => {
      if (node.type.name === spec.name) {
        if (!spec.continuous && !(parent === contexts[i])) {
          indices[i] = 1;
          contexts[i] = parent;
        }
        if ('convertNumber' in spec.updateNumber) {
          updateNumber(
            transaction,
            schema,
            node,
            spec.updateNumber.convertNumber(indices[i]),
            spec.updateNumber.numberPredicate,
          );
        } else {
          spec.updateNumber({ transaction, pos, number: indices[i] });
        }
        indices[i] += 1;
      }
    });
  });
  return transaction;
}
