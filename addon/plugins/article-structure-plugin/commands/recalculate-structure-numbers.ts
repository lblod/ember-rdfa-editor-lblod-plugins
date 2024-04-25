import { PNode, Schema, Transaction } from '@lblod/ember-rdfa-editor';
import { findNodeByRdfaId } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { isRdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
import type { Resource } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { ELI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { StructureSpec } from '..';

type UpdateNumberProps = {
  transaction: Transaction;
  schema: Schema;
  node: PNode;
  number: string;
  numberPredicate?: Resource;
};

function updateNumber({
  transaction,
  schema,
  node,
  number,
  numberPredicate,
}: UpdateNumberProps) {
  const { attrs } = node;

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

  /**
   * Recording all calls to `updateNumber` in an array to run them all
   * _after_ we've run all the `setNumber` calls.
   *
   * This is necessary because `updateNumber` calls can change positions of the nodes
   * in the document, and the calls to `setNumber` are dependent on the correct position
   * before the change.
   */
  const updateNumberCalls: UpdateNumberProps[] = [];

  doc.descendants((node, pos, parent) => {
    structureSpecs.forEach((spec, i) => {
      if (node.type.name === spec.name) {
        if (!spec.continuous && !(parent === contexts[i])) {
          indices[i] = 1;
          contexts[i] = parent;
        }

        const startNumber = spec.getStartNumber?.({ pos, transaction });

        if (startNumber) {
          indices[i] = startNumber;
        }

        spec.setNumber({ transaction, pos, number: indices[i] });

        if ('convertNumber' in spec.numberConfig) {
          updateNumberCalls.push({
            transaction,
            schema,
            node,
            number: spec.numberConfig.convertNumber(indices[i]),
            numberPredicate: spec.numberConfig.numberPredicate,
          });
        }

        indices[i] += 1;
      }
    });
  });

  updateNumberCalls.forEach(updateNumber);

  return transaction;
}
