import { Command } from '@lblod/ember-rdfa-editor';
import { buildDataTable } from '../utils/build-data-table';
interface HasToString {
  toString(): string;
}

type Args<T extends string> = {
  fields: readonly T[];
  records: Record<T, HasToString>[];
  includeHeader?: boolean;
  labels?: Record<T, string>;
};

export function insertDataTable<T extends string>({
  fields,
  records,
  includeHeader = true,
  labels,
}: Args<T>): Command {
  return (state, dispatch) => {
    const {
      schema,
      selection: { $from },
    } = state;

    const specAllowSplitByTable = $from.parent.type.spec[
      'allowSplitByTable'
    ] as boolean | undefined;

    const allowSplitByTable: boolean =
      specAllowSplitByTable === undefined ? true : specAllowSplitByTable;

    if (!allowSplitByTable) return false;

    if (dispatch) {
      const tr = state.tr;
      dispatch(
        tr
          .replaceSelectionWith(
            buildDataTable({ schema, fields, records, includeHeader, labels }),
          )
          .scrollIntoView(),
      );
    }

    return true;
  };
}
