import { v4 as uuid } from 'uuid';
import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import factory from 'rdf-ext';
import process from 'process';
import { PNode, ProseController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { Command } from 'prosemirror-state';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { Readable } from 'readable-stream';
import { ProseStore } from '@lblod/ember-rdfa-editor/addon/utils/datastore/prose-store';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import { nodesBetween } from '@lblod/ember-rdfa-editor/utils/position-utils';
import { insertHtml } from '@lblod/ember-rdfa-editor/addon/commands/insert-html-command';
import recalculateStructureNumbersV2 from './recalculate-structure-numbers-command-v2';
import { Structure } from '../utils/article-structure-plugin/constants';

export async function validateDatastore(
  datastore: ProseStore,
  shaclConstraint: unknown
) {
  const s = new Readable();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  s._read = () => {}; // redundant? see update below
  s.push(shaclConstraint);
  s.push(null);
  const parser = new ParserN3({ factory });
  const shapes = await factory.dataset().import(parser.import(s));
  const data = datastore.dataset;
  const validator = new SHACLValidator(shapes, { factory });
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const report = await validator.validate(data);
  return report;
}

export default function insertArticleStructureV2(
  controller: ProseController,
  structureName: string,
  options: {
    structures: Structure[];
    structureTypes: string[];
  },
  report: ValidationReport,
  intlService: IntlService
): Command {
  return (state, dispatch) => {
    const structureToAddIndex = options.structures.findIndex(
      (structure) => structure.title === structureName
    );
    const structureToAdd = unwrap(options.structures[structureToAddIndex]);
    const structureUri = `${structureToAdd.uriBase}${uuid()}`;

    window.process = process;
    const urisNotAllowedToInsert = report.results.map(
      (result) => result.focusNode?.value
    );
    const { selection } = controller.state;
    const filterFunction = (node: PNode) => {
      const nodeUri = node.attrs['resource'] as string | undefined;
      if (nodeUri && !urisNotAllowedToInsert.includes(nodeUri)) {
        return true;
      }
      return false;
    };
    let resourceToInsert = nodesBetween(
      selection.$from,
      true,
      false,
      filterFunction
    ).next().value;
    if (!resourceToInsert) {
      resourceToInsert = nodesBetween(
        selection.$from,
        true,
        true,
        filterFunction
      ).next().value;
    }
    if (!resourceToInsert) return false;
    let nodeToInsert: { node: PNode; pos: number } | undefined | null;
    if (structureToAdd.insertPredicate) {
      const resourceToInsertUri = resourceToInsert.node.attrs[
        'resource'
      ] as string;
      const nodeToInsertPredicateNodes = controller.datastore
        .match(`>${resourceToInsertUri}`, `>${structureToAdd.insertPredicate}`)
        .asPredicateNodeMapping()
        .single();
      nodeToInsert =
        nodeToInsertPredicateNodes && [...nodeToInsertPredicateNodes.nodes][0];
    } else {
      nodeToInsert = resourceToInsert;
    }
    if (!nodeToInsert) {
      return false;
    }
    if (dispatch) {
      const structureHtml = structureToAdd.template(structureUri, intlService);

      controller.doCommand(
        insertHtml(
          structureHtml,
          nodeToInsert.pos + 1,
          nodeToInsert.pos + nodeToInsert.node.nodeSize - 1
        )
      );
      const containerNode = unwrap(
        controller.state.doc.nodeAt(nodeToInsert.pos)
      );
      const containerRange = {
        from: nodeToInsert.pos,
        to: nodeToInsert.pos + containerNode.nodeSize,
      };
      controller.doCommand(
        recalculateStructureNumbersV2(
          controller,
          containerRange,
          structureToAdd,
          options
        )
      );
    }
    return true;
  };
}
