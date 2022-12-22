import { v4 as uuid } from 'uuid';
import { ProseController, TextSelection } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { Command } from 'prosemirror-state';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import { findNodes } from '@lblod/ember-rdfa-editor/utils/position-utils';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { ResolvedArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { getRdfaAttribute } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';

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
    const filterFunction = ({ from }: { from: number }) => {
      const node = unwrap(controller.state.doc.nodeAt(from));
      const nodeUri = getRdfaAttribute(node, 'resource').pop();
      if (nodeUri && !urisNotAllowedToInsert.includes(nodeUri)) {
        return true;
      }
      return false;
    };

    let structureContainerRange =
      findNodes(
        controller.state.doc,
        selection.from,
        true,
        false,
        filterFunction
      ).next().value ??
      findNodes(
        controller.state.doc,
        selection.from,
        true,
        true,
        filterFunction
      ).next().value;

    if (!structureContainerRange) return false;
    const structureContainerNode = unwrap(
      controller.state.doc.nodeAt(structureContainerRange.from)
    );
    if (structureTypeToAdd.insertPredicate) {
      const structureContainerUri = getRdfaAttribute(
        structureContainerNode,
        'resource'
      ).pop();
      if (!structureContainerUri) {
        return false;
      }
      structureContainerRange = [
        ...controller.datastore
          .match(
            `>${structureContainerUri}`,
            `>${structureTypeToAdd.insertPredicate.long}`
          )
          .asPredicateNodeMapping()
          .nodes(),
      ][0];
    }
    if (!structureContainerRange) {
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
        structureContainerNode.childCount === 1 &&
        structureContainerNode.child(0).childCount === 1 &&
        structureContainerNode.child(0).child(0).type ===
          controller.schema.nodes['placeholder']
      ) {
        insertRange = {
          from: structureContainerRange.from + 1,
          to: structureContainerRange.to - 1,
        };
      } else {
        insertRange = {
          from: structureContainerRange.to - 1,
          to: structureContainerRange.to - 1,
        };
      }
      controller.doCommand(
        insertHtml(structureHtml, insertRange.from, insertRange.to)
      );
      const containerNode = unwrap(
        controller.state.doc.nodeAt(structureContainerRange.from)
      );
      const containerRange = {
        from: structureContainerRange.from,
        to: structureContainerRange.from + containerNode.nodeSize,
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
