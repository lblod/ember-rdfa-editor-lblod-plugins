import { v4 as uuid } from 'uuid';
import {
  PNode,
  ProseController,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { Command } from 'prosemirror-state';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import { nodesBetween } from '@lblod/ember-rdfa-editor/utils/position-utils';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { ResolvedArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';

export default function insertArticleStructureV2(
  controller: ProseController,
  structureName: string,
  options: ResolvedArticleStructurePluginOptions,
  report: ValidationReport,
  intlService: IntlService
): Command {
  return (_state, dispatch) => {
    const structureTypeToAdd = options.structures.find(
      (structure) => structure.title === structureName
    );
    if (!structureTypeToAdd) {
      console.warn(`Structure type ${structureName} not recognized`);
      return false;
    }
    const structureUri = `${structureTypeToAdd.uriBase}${uuid()}`;
    const urisNotAllowedToInsert = report.results.map(
      (result) => result.focusNode?.value
    );
    const { selection } = controller.state;
    const filterFunction = ({ node }: { node: PNode }) => {
      const nodeUri = node.attrs['resource'] as string | undefined;
      if (nodeUri && !urisNotAllowedToInsert.includes(nodeUri)) {
        return true;
      }
      return false;
    };

    let structureContainer =
      nodesBetween(selection.$from, true, false, filterFunction).next().value ??
      nodesBetween(selection.$from, true, true, filterFunction).next().value;

    if (!structureContainer) return false;

    if (structureTypeToAdd.insertPredicate) {
      const structureContainerUri = structureContainer.node.attrs[
        'resource'
      ] as string;
      structureContainer = [
        ...controller.datastore
          .match(
            `>${structureContainerUri}`,
            `>${structureTypeToAdd.insertPredicate.long}`
          )
          .asPredicateNodeMapping()
          .nodes(),
      ][0];
    }
    if (!structureContainer) {
      return false;
    }
    if (dispatch) {
      const structureHtml = structureTypeToAdd.template(
        structureUri,
        intlService
      );

      //Detect if structureContainer only contains a placeholder, if so replace the full content of the structureContainer
      let insertRange: { from: number; to: number };
      if (
        structureContainer.node.childCount === 1 &&
        structureContainer.node.child(0).childCount === 1 &&
        structureContainer.node.child(0).child(0).type ===
          controller.schema.nodes['placeholder']
      ) {
        insertRange = {
          from: structureContainer.pos + 1,
          to: structureContainer.pos + structureContainer.node.nodeSize - 1,
        };
      } else {
        insertRange = {
          from: structureContainer.pos + structureContainer.node.nodeSize - 1,
          to: structureContainer.pos + structureContainer.node.nodeSize - 1,
        };
      }
      controller.doCommand(
        insertHtml(structureHtml, insertRange.from, insertRange.to)
      );
      const containerNode = unwrap(
        controller.state.doc.nodeAt(structureContainer.pos)
      );
      const containerRange = {
        from: structureContainer.pos,
        to: structureContainer.pos + containerNode.nodeSize,
      };
      controller.doCommand(
        recalculateStructureNumbers(
          controller,
          containerRange,
          structureTypeToAdd,
          options
        )
      );

      const selection = TextSelection.near(
        controller.state.doc.resolve(insertRange.from)
      );
      controller.withTransaction((tr) => {
        return tr.setSelection(selection);
      });
      controller.focus();
    }
    return true;
  };
}
