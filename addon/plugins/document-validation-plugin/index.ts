import factory from '@rdfjs/dataset';
import SHACLValidator from 'rdf-validate-shacl';
import { Parser as ParserN3 } from 'n3';
import { RdfaParser } from 'rdfa-streaming-parser';
import {
  ProsePlugin,
  PluginKey,
  EditorView,
  SayController,
} from '@lblod/ember-rdfa-editor';
import removeQuotes from '@lblod/ember-rdfa-editor-lblod-plugins/utils/remove-quotes';
import {
  DataFactory,
  DatasetCore,
  DatasetCoreFactory,
  Quad,
} from '@rdfjs/types';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

export const documentValidationPluginKey =
  new PluginKey<DocumentValidationPluginState>('DOCUMENT_VALIDATION');

type Violation =
  | {
      action: (controller: SayController, report: ValidationReport) => void;
      buttonTitle: string;
    }
  | {
      helpText: string;
    };
type Rule =
  | {
      shaclRule: string;
      violations: {
        [key: string]: Violation;
      };
    }
  | {
      shaclRule: string;
      action: (controller: SayController, report: ValidationReport) => void;
      buttonTitle: string;
    }
  | {
      shaclRule: string;
      helpText: string;
    };

interface DocumentValidationPluginArgs {
  documentShape: string;
  rules: Rule[];
}

export type ShaclValidationReport = ValidationReport.ValidationReport<
  DataFactory<Quad, Quad> &
    DatasetCoreFactory<Quad, Quad, DatasetCore<Quad, Quad>>
>;

type propertyWithError = {
  message: string;
  subject: string | undefined;
  shape: string;
  constraint: string;
};
interface DocumentValidationResult {
  report?: ValidationReport;
  propertiesWithoutErrors: { message: string }[];
  propertiesWithErrors: propertyWithError[];
}
export interface DocumentValidationTransactionMeta
  extends DocumentValidationResult {
  type: string;
}
export interface DocumentValidationPluginState
  extends DocumentValidationResult {
  documentShape: string;
  validationCallback: typeof validationCallback;
  rules: Rule[];
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
          rules: options.rules,
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

  const errorMessagePred = sayFactory.namedNode(
    'http://www.w3.org/ns/shacl#resultMessage',
  );
  const propertiesWithErrors: propertyWithError[] = [];
  for (const r of report.results) {
    const sourceShape = r.sourceShape;
    if (sourceShape) {
      const match = shacl.match(sourceShape, errorMessagePred, undefined);
      const message = [...match][0]?.object.value;
      if (message) {
        propertiesWithErrors.push({
          message: removeQuotes(message),
          subject: r.focusNode?.value,
          shape: sourceShape.value,
          constraint: r.sourceConstraintComponent?.value as string,
        });
      }
    }
  }

  const propertiesWithoutErrorsArray = propertyNodes.filter((propertyNode) =>
    propertiesWithErrors.every(
      (propertyWithError) => propertyWithError.shape !== propertyNode.value,
    ),
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
    propertiesWithErrors: propertiesWithErrors,
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
