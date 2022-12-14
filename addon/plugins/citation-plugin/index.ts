import {
  Decoration,
  DecorationSet,
  PluginKey,
  PNode,
  ProsePlugin,
  Schema,
} from '@lblod/ember-rdfa-editor';
import processMatch, {
  RegexpMatchArrayWithIndices,
} from './utils/process-match';
import {
  InlineDecorationSpec,
  WidgetSpec,
} from '@lblod/ember-rdfa-editor/addon';
import { EditorState, EditorStateConfig } from 'prosemirror-state';
import {
  expect,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { datastoreKey } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { ProseStore } from '@lblod/ember-rdfa-editor/addon/utils/datastore/prose-store';

const BASIC_MULTIPLANE_CHARACTER = '\u0021-\uFFFF'; // most of the characters used around the world

// Regex nicely structured:
// (
//   (
//     \w*decreet |
//     omzendbrief |
//     verdrag |
//     grondwetswijziging |
//     samenwerkingsakkoord |
//     \w*wetboek |
//     protocol |
//     besluit[^\S\n]van[^\S\n]de[^\S\n]vlaamse[^\S\n]regering |
//     geco[öo]rdineerde wetten |
//     \w*wet |
//     koninklijk[^\S\n]?besluit |
//     ministerieel[^\S\n]?besluit |
//     genummerd[^\S\n]?koninklijk[^\S\n]?besluit
//   )
//   [^\S\n]*
//   (
//     ([^\S\n] | [\u0021-\uFFFF\d;:'"()&\-_]){3,}
//   )?
// )
const NNWS = '[^\\S\\n]';
export const CITATION_REGEX = new RegExp(
  `((?<type>\\w*decreet|omzendbrief|verdrag|grondwetswijziging|samenwerkingsakkoord|\\w*wetboek|protocol|besluit${NNWS}van${NNWS}de${NNWS}vlaamse${NNWS}regering|geco[öo]rdineerde${NNWS}wetten|\\w*wet|koninklijk${NNWS}?besluit|ministerieel${NNWS}?besluit|genummerd${NNWS}?koninklijk${NNWS}?besluit|\\w*${NNWS}?besluit)${NNWS}*(?<searchTerms>(${NNWS}|[${BASIC_MULTIPLANE_CHARACTER};:'"()&-_]){3,})?)`,
  'uidg'
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

function calculateDecorations(
  schema: CitationSchema,
  doc: PNode,
  datastore: ProseStore
) {
  const decorations: Decoration[] = [];
  const nodes = datastore
    .match(null, 'besluit:motivering')
    .asPredicateNodeMapping()
    .nodes();
  for (const motivationNode of nodes) {
    motivationNode.node.descendants((node, pos) => {
      if (
        node.isText &&
        node.text &&
        !schema.marks.citation.isInSet(node.marks)
      ) {
        for (const match of node.text.matchAll(CITATION_REGEX)) {
          const processedMatch = processMatch(
            match as RegexpMatchArrayWithIndices
          );

          if (processedMatch) {
            const { text, legislationTypeUri, searchTextMatch } =
              processedMatch;
            const { start, end } = searchTextMatch;
            decorations.push(
              Decoration.inline(
                pos + unwrap(motivationNode.pos?.pos) + 1 + start,
                pos + unwrap(motivationNode.pos?.pos) + 1 + end,

                {
                  'data-editor-highlight': 'true',
                },
                {
                  searchText: text,
                  legislationTypeUri,
                }
              )
            );
          }
        }
      }
    });
  }
  return DecorationSet.create(doc, decorations);
}

export const citationKey = new PluginKey<DecorationSet>('citation');

export function citationPlugin(): ProsePlugin {
  const citation: ProsePlugin<DecorationSet> = new ProsePlugin({
    key: citationKey,
    state: {
      init(stateConfig: EditorStateConfig, state: EditorState) {
        const { doc, schema } = state;
        // SAFETY: we require that the citationmark is added to the schema
        return calculateDecorations(
          schema,
          doc,
          expect(
            'the datastore plugin is required for this plugin',
            datastoreKey.getState(state)
          )
        );
      },
      apply(tr, set, oldState, newState) {
        const { doc, schema } = newState;
        return calculateDecorations(
          schema,
          doc,

          expect(
            'the datastore plugin is required for this plugin',
            datastoreKey.getState(newState)
          )
        );
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
  componentName: 'citation-plugin/citation-card',
};
export const citationInsert: WidgetSpec = {
  desiredLocation: 'insertSidebar',
  componentName: 'citation-plugin/citation-insert',
};
