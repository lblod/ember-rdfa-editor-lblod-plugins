import {
  Decoration,
  DecorationSet,
  PluginKey,
  PNode,
  ProsePlugin,
  Schema,
} from '@lblod/ember-rdfa-editor';
import processMatch from './utils/processMatch';
import {
  InlineDecorationSpec,
  WidgetSpec,
} from '@lblod/ember-rdfa-editor/addon';
import { EditorStateConfig } from 'prosemirror-state';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

const BASIC_MULTIPLANE_CHARACTER = '\u0021-\uFFFF'; // most of the characters used around the world
const NNWS = '[^\\S\\n]';
const CITATION_REGEX = new RegExp(
  `((\\w*decreet|omzendbrief|verdrag|grondwetswijziging|samenwerkingsakkoord|\\w*wetboek|protocol|besluit${NNWS}van${NNWS}de${NNWS}vlaamse${NNWS}regering|geco[öo]rdineerde${NNWS}wetten|\\w*wet|koninklijk${NNWS}?besluit|ministerieel${NNWS}?besluit|genummerd${NNWS}?koninklijk${NNWS}?besluit|\\w*${NNWS}?besluit)${NNWS}*((${NNWS}|[${BASIC_MULTIPLANE_CHARACTER};:'"()&-_]){3,})?)`,
  'uig'
);
export type CitationSchema = Schema<string, 'citation'>;

export interface CitationDecorationSpec extends InlineDecorationSpec {
  legislationTypeUri: string;
  searchText: string;
}

export interface CitationDecoration extends Decoration {
  spec: CitationDecorationSpec;
}

export { citation } from './marks/citation';

function calculateDecorations(schema: CitationSchema, doc: PNode) {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (
      node.isText &&
      node.text &&
      !schema.marks.citation.isInSet(node.marks)
    ) {
      for (const match of node.text.matchAll(CITATION_REGEX)) {
        const { text, legislationTypeUri } = processMatch(match);
        console.log(legislationTypeUri);
        const index = unwrap(match.index);
        decorations.push(
          Decoration.inline(
            pos + index,
            pos + index + match[0].length,
            {
              style: 'background: yellow',
            },
            {
              searchText: text,
              legislationTypeUri,
            }
          )
        );
      }
    }
  });
  return DecorationSet.create(doc, decorations);
}

export const citationKey = new PluginKey<DecorationSet>('citation');

export function citationPlugin(): ProsePlugin {
  const citation: ProsePlugin<DecorationSet> = new ProsePlugin({
    key: citationKey,
    state: {
      init(state: EditorStateConfig) {
        const { doc, schema } = state;
        // SAFETY: we require that the citationmark is added to the schema
        return calculateDecorations(schema as CitationSchema, unwrap(doc));
      },
      apply(tr, set, oldState, newState) {
        const { doc, schema } = newState;
        return calculateDecorations(schema, doc);
      },
    },
    props: {
      decorations(state): DecorationSet | undefined {
        return citation.getState(state);
      },
    },
  });
  return citation;
}

export const citationCard: WidgetSpec = {
  desiredLocation: 'sidebar',
  componentName: 'editor-plugins/citaat-card',
};
export const citationInsert: WidgetSpec = {
  desiredLocation: 'insertSidebar',
  componentName: 'editor-plugins/citaat-insert',
};
