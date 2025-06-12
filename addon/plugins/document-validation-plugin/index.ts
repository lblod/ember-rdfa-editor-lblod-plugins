import factory from '@rdfjs/dataset';
import SHACLValidator from 'rdf-validate-shacl';
import { Parser as ParserN3 } from 'n3';
import { RdfaParser } from 'rdfa-streaming-parser';
import { ProsePlugin, PluginKey, EditorView } from '@lblod/ember-rdfa-editor';
import removeQuotes from '@lblod/ember-rdfa-editor-lblod-plugins/utils/remove-quotes';

export const documentValidationPluginKey = new PluginKey('DOCUMENT_VALIDATION');

interface DocumentValidationPluginArgs {
  documentShape: string;
}

export const documentValidationPlugin = (
  options: DocumentValidationPluginArgs,
) =>
  new ProsePlugin({
    key: documentValidationPluginKey,
    state: {
      init() {
        return {
          validationCallback: validationCallback,
          documentShape: options.documentShape,
        };
      },
      apply(tr, state) {
        const pluginTransaction = tr.getMeta(documentValidationPluginKey);
        if (pluginTransaction) {
          if (pluginTransaction.type === 'setNewReport') {
            return {
              ...state,
              report: pluginTransaction.report,
              propertiesWithoutErrors:
                pluginTransaction.propertiesWithoutErrors,
            };
          }
        }

        return state;
      },
    },
  });

async function validationCallback(view: EditorView, documentHtml: string) {
  const { documentShape } = documentValidationPluginKey.getState(view.state);
  const rdf = await htmlToRdf(documentHtml);
  const shacl = await parse(documentShape);
  const validator = new SHACLValidator(shacl, {
    allowNamedNodeInList: true,
  });
  const report = await validator.validate(rdf);
  const propertyNodesMap = shacl.match(
    undefined,
    'http://www.w3.org/ns/shacl#property',
    undefined,
  )._quads;

  const propertyNodes = Array.from(propertyNodesMap, ([_, quad]) => quad).map(
    (quad) => quad._object.id,
  );
  const propertiesWithErrors = [];
  for (const r of report.results) {
    const shapeId = r.sourceShape.id;
    propertiesWithErrors.push(shapeId);
  }
  const propertiesWithoutErrorsArray = propertyNodes.filter(
    (shapeId) => !propertiesWithErrors.includes(shapeId),
  );
  const propertiesWithoutErrors = propertiesWithoutErrorsArray
    .map((id) => {
      const match = shacl.match(
        id,
        'http://mu.semte.ch/vocabularies/ext/sucessMessage',
        undefined,
      );
      const message = Array.from(match._quads, ([_, quad]) => quad)[0]?._object
        .id;
      return message ? { message: removeQuotes(message) } : undefined;
    })
    .filter((message) => message);
  view.dispatch(
    view.state.tr.setMeta(documentValidationPluginKey, {
      type: 'setNewReport',
      report,
      propertiesWithoutErrors,
    }),
  );
}

async function parse(triples: string) {
  return new Promise((resolve, reject) => {
    const parser = new ParserN3();
    const dataset = factory.dataset();
    parser.parse(triples, (error, quad) => {
      if (error) {
        console.warn(error);
        reject(error);
      } else if (quad) {
        dataset.add(quad);
      } else {
        resolve(dataset);
      }
    });
  });
}

function htmlToRdf(html) {
  return new Promise((res, rej) => {
    const myParser = new RdfaParser({ contentType: 'text/html' });
    const dataset = factory.dataset();
    myParser
      .on('data', (data) => {
        dataset.add(data);
      })
      .on('error', rej)
      .on('end', () => res(dataset));
    myParser.write(html);
    myParser.end();
  });
}
