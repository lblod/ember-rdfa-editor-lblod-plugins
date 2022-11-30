import { v4 as uuid } from 'uuid';
import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import factory from 'rdf-ext';
import { Readable } from 'stream-browserify';
import process from 'process';

export default class InsertArticleStructureV2Command {
  name = 'insert-article-structure-v2';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  async execute(controller, structureName, options, intlService) {
    console.log(structureName);
    const structureToAddIndex = options.structures.findIndex(
      (structure) => structure.title === structureName
    );
    const structureToAdd = options.structures[structureToAddIndex];
    const structureUri = `${structureToAdd.uriBase}${uuid()}`;
    const shaclConstraint = structureToAdd.shaclConstraint;
    window.process = process;
    const s = new Readable();
    s._read = () => {}; // redundant? see update below
    s.push(shaclConstraint);
    s.push(null);
    const parser = new ParserN3({ factory });
    const shapes = await factory.dataset().import(parser.import(s));
    console.log(shapes);
    const data = controller.datastore._dataset;
    console.log(data);
    const validator = new SHACLValidator(shapes, { factory });
    const report = await validator.validate(data);
    const urisNotAllowedToInsert = report.results.map(
      (result) => result.focusNode.value
    );
    const treeWalker = new controller.treeWalkerFactory({
      root: controller.modelRoot,
      start: controller.selection.lastRange._start.parentElement,
      end: controller.modelRoot,
      reverse: false,
      visitParentUpwards: true,
      filter: (node) => {
        const nodeUri = node.getAttribute('resource');
        if (nodeUri && !urisNotAllowedToInsert.includes(nodeUri)) {
          return 0;
        }
        return 1;
      },
    });
    let resourceToInsert = treeWalker.nextNode();
    console.log(resourceToInsert);
    if (!resourceToInsert) {
      const treeWalkerAscend = new controller.treeWalkerFactory({
        root: controller.modelRoot,
        start: controller.selection.lastRange._start.parentElement,
        end: controller.modelRoot,
        reverse: true,
        visitParentUpwards: true,
        filter: (node) => {
          const nodeUri = node.getAttribute('resource');
          if (nodeUri && !urisNotAllowedToInsert.includes(nodeUri)) {
            return 0;
          }
          return 1;
        },
      });
      resourceToInsert = treeWalkerAscend.nextNode();
    }
    let nodeToInsert;
    if (structureToAdd.insertPredicate) {
      const resourceToInsertUri = resourceToInsert.getAttribute('resource');
      const nodeToInsertPredicateNodes = controller.datastore
        .match(
          `>${resourceToInsertUri}`,
          `>${structureToAdd.insertPredicate}`,
          null
        )
        .asPredicateNodes()
        .next().value;
      console.log(nodeToInsertPredicateNodes);
      console.log(controller.datastore._dataset);
      nodeToInsert = [...nodeToInsertPredicateNodes.nodes][0];
    } else {
      nodeToInsert = resourceToInsert;
    }
    const structureHtml = structureToAdd.template(structureUri, intlService);
    controller.executeCommand(
      'insert-html',
      structureHtml,
      controller.rangeFactory.fromInNode(
        nodeToInsert,
        nodeToInsert.getMaxOffset(),
        nodeToInsert.getMaxOffset()
      )
    );
    controller.executeCommand(
      'recalculate-structure-numbers-v2',
      controller,
      nodeToInsert,
      structureToAdd,
      options
    );
  }
}
