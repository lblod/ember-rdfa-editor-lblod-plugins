import { PNode, Schema } from '@lblod/ember-rdfa-editor';
import { unwrap } from '../utils/option';
interface HasToString {
  toString(): string;
}

type Args<T extends string> = {
  schema: Schema;
  fields: readonly T[];
  records: Record<T, HasToString>[];
  includeHeader?: boolean;
  labels?: Record<T, string>;
};

export function buildDataTable<T extends string>({
  schema,
  fields,
  records,
  includeHeader = true,
  labels,
}: Args<T>) {
  const rows: PNode[] = [];
  const proportionalWidth = 100 / fields.length;
  if (includeHeader) {
    const headerCells = [];
    for (const field of fields) {
      headerCells.push(
        unwrap(
          schema.nodes['table_header'].createAndFill(
            proportionalWidth
              ? {
                  colwidth: [proportionalWidth],
                }
              : undefined,
            schema.nodes.paragraph.create(
              null,
              schema.text(labels?.[field] ?? field),
            ),
          ),
        ),
      );
    }
    rows.push(schema.node('table_row', null, headerCells));
  }

  for (const record of records) {
    const cells = [];
    for (const field of fields) {
      cells.push(
        unwrap(
          schema.nodes['table_cell'].createAndFill(
            proportionalWidth
              ? {
                  colwidth: [proportionalWidth],
                }
              : undefined,
            schema.nodes.paragraph.create(
              null,
              schema.text(record[field].toString()),
            ),
          ),
        ),
      );
    }
    rows.push(schema.node('table_row', null, cells));
  }
  return schema.node('table', null, rows);
}
