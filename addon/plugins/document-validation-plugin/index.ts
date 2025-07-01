import factory from '@rdfjs/dataset';
import SHACLValidator from 'rdf-validate-shacl';
import { Parser as ParserN3 } from 'n3';
import { RdfaParser } from 'rdfa-streaming-parser';
import { ProsePlugin, PluginKey, EditorView } from '@lblod/ember-rdfa-editor';
import removeQuotes from '@lblod/ember-rdfa-editor-lblod-plugins/utils/remove-quotes';
import {
  BlankNode,
  DataFactory,
  DatasetCore,
  DatasetCoreFactory,
  NamedNode,
  Quad,
} from '@rdfjs/types';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

export const documentValidationPluginKey =
  new PluginKey<DocumentValidationPluginState>('DOCUMENT_VALIDATION');

interface DocumentValidationPluginArgs {
  documentShape: string;
}

export type ShaclValidationReport = ValidationReport.ValidationReport<
  DataFactory<Quad, Quad> &
    DatasetCoreFactory<Quad, Quad, DatasetCore<Quad, Quad>>
>;

interface DocumentValidationResult {
  report?: ValidationReport;
  propertiesWithoutErrors: { message: string }[];
  propertiesWithErrors: (
    | {
        message: string;
        subject: string | undefined;
      }
    // TODO get rid of this?
    | undefined
  )[];
}
export interface DocumentValidationTransactionMeta
  extends DocumentValidationResult {
  type: string;
}
export interface DocumentValidationPluginState
  extends DocumentValidationResult {
  documentShape: string;
  validationCallback: typeof validationCallback;
}

export const documentValidationPlugin = (
  options: DocumentValidationPluginArgs,
) =>
  new ProsePlugin<DocumentValidationPluginState>({
    key: documentValidationPluginKey,
    state: {
      init() {
        return {
          validationCallback: validationCallback,
          documentShape: options.documentShape,
          propertiesWithoutErrors: [],
          propertiesWithErrors: [],
        };
      },
      apply(tr, state) {
        const pluginTransaction = tr.getMeta(documentValidationPluginKey) as
          | DocumentValidationTransactionMeta
          | undefined;
        if (pluginTransaction && pluginTransaction.type === 'setNewReport') {
          return {
            ...state,
            report: pluginTransaction.report,
            propertiesWithoutErrors: pluginTransaction.propertiesWithoutErrors,
            propertiesWithErrors: pluginTransaction.propertiesWithErrors,
          };
        }

        return state;
      },
    },
  });

async function validationCallback(view: EditorView, documentHtml: string) {
  const documentValidationState = documentValidationPluginKey.getState(
    view.state,
  );
  if (!documentValidationState) {
    console.warn('No shape found in the document validation plugin');
    return;
  }
  const { documentShape } = documentValidationState;
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

  const propertiesWithErrors: {
    sourceShape: BlankNode | NamedNode<string>;
    focusNode: BlankNode | NamedNode<string> | null;
  }[] = [];
  for (const r of report.results) {
    const sourceShape = r.sourceShape;
    if (sourceShape)
      propertiesWithErrors.push({ sourceShape, focusNode: r.focusNode });
  }
  const errorMessagePred = sayFactory.namedNode(
    'http://www.w3.org/ns/shacl#resultMessage',
  );
  const propertiesWithErrorsMessages = propertiesWithErrors
    .map(({ sourceShape, focusNode }) => {
      const match = shacl.match(sourceShape, errorMessagePred, undefined);
      const message = [...match][0]?.object.value;
      return message
        ? { message: removeQuotes(message), subject: focusNode?.value }
        : undefined;
    })
    .filter((message) => message);
  const propertiesWithoutErrorsArray = propertyNodes.filter((propertyNode) =>
    propertiesWithErrors.some((propertyWithError) => {
      return propertyWithError.sourceShape.value !== propertyNode.value;
    }),
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
    propertiesWithErrors: propertiesWithErrorsMessages,
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
