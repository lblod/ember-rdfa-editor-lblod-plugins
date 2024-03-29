import { PNode, Transaction } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';

export default function recalculateStructureNumbers(
  transaction: Transaction,
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

        const startNumber = spec.getStartNumber({ pos, transaction });

        if (startNumber) {
          indices[i] = startNumber;
        }

        spec.updateNumber({ number: indices[i], pos, transaction });
        indices[i] += 1;
      }
    });
  });
  return transaction;
}
