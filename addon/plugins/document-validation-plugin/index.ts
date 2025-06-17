import factory from '@rdfjs/dataset';
import SHACLValidator from 'rdf-validate-shacl';
import { Parser as ParserN3 } from 'n3';
import { RdfaParser } from 'rdfa-streaming-parser';
import { ProsePlugin, PluginKey, EditorView } from '@lblod/ember-rdfa-editor';
import removeQuotes from '@lblod/ember-rdfa-editor-lblod-plugins/utils/remove-quotes';
import {
  DataFactory,
  DatasetCore,
  DatasetCoreFactory,
  Quad,
} from '@rdfjs/types';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

export const documentValidationPluginKey = new PluginKey('DOCUMENT_VALIDATION');

interface DocumentValidationPluginArgs {
  documentShape: string;
}

export type ShaclValidationReport = ValidationReport.ValidationReport<
  DataFactory<Quad, Quad> &
    DatasetCoreFactory<Quad, Quad, DatasetCore<Quad, Quad>>
>;

interface documentValidationTransactionMeta {
  type: string;
  report: ValidationReport;
  propertiesWithoutErrors: string[];
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
        const pluginTransaction = tr.getMeta(documentValidationPluginKey) as
          | documentValidationTransactionMeta
          | undefined;
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
    // @ts-expect-error ts doesn't recognize the configuration parameter not sure why
    allowNamedNodeInList: true,
  });
  const report = validator.validate(rdf);
  const sayFactory = new SayDataFactory();
  const propertyPred = sayFactory.namedNode(
    'http://www.w3.org/ns/shacl#property',
  );
  const propertyNodes = [
    ...shacl.match(undefined, propertyPred, undefined),
  ].map((quad: Quad) => quad.object);

  const propertiesWithErrors: string[] = [];
  for (const r of report.results) {
    const shapeId = r.sourceShape?.value;
    if (shapeId) propertiesWithErrors.push(shapeId);
  }
  const propertiesWithoutErrorsArray = propertyNodes.filter(
    (term) => !propertiesWithErrors.includes(term.value),
  );

  const successMessagePred = sayFactory.namedNode(
    'http://mu.semte.ch/vocabularies/ext/successMessage',
  );
  const propertiesWithoutErrors = propertiesWithoutErrorsArray
    .map((propertyNode) => {
      const match = shacl.match(propertyNode, successMessagePred, undefined);
      const message = [...match][0]?.object.value;
      return message ? { message: removeQuotes(message) } : undefined;
    })
    .filter((message) => message);
  const transaction = view.state.tr;
  transaction.setMeta(documentValidationPluginKey, {
    type: 'setNewReport',
    report,
    propertiesWithoutErrors,
  });
  transaction.setMeta('addToHistory', false);
  view.dispatch(transaction);
}

interface N3Parser {
  parse: (
    triples: string,
    callback: (error: string, quad: Quad) => void,
  ) => void;
}

async function parse(triples: string): Promise<DatasetCore<Quad>> {
  return new Promise((resolve, reject) => {
    // @ts-expect-error we have to use a custom type to make the quads compatible or else ts will complain
    const parser: N3Parser = new ParserN3();
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

function htmlToRdf(html: string): Promise<DatasetCore<Quad>> {
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
