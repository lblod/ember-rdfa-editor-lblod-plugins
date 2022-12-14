import {
  Decoration,
  DecorationSet,
  MarkSpec,
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
  unwrapOr,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { datastoreKey } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { ProseStore } from '@lblod/ember-rdfa-editor/addon/utils/datastore/prose-store';
import { citation } from './marks/citation';

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

function calculateDecorations(
  schema: CitationSchema,
  doc: PNode,
  activeRanges: [number, number][]
) {
  const decorations: Decoration[] = [];

  for (const [start, end] of activeRanges) {
    doc.nodesBetween(start, end, (node: PNode, pos: number): boolean => {
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
            const { start: matchStart, end: matchEnd } = searchTextMatch;
            console.log(pos);
            const decorationStart = pos + matchStart;
            const decorationEnd = pos + matchEnd;
            decorations.push(
              Decoration.inline(
                decorationStart,
                decorationEnd,

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
      return true;
    });
  }
  return DecorationSet.create(doc, decorations);
}

interface CitationPluginState {
  highlights: DecorationSet;
  activeRanges: [number, number][];
}

export type CitationPlugin = ProsePlugin<CitationPluginState>;

function citationPlugin({
  activeIn = defaultActiveIn,
}: CitationPluginConfig): CitationPlugin {
  const citation: CitationPlugin = new ProsePlugin({
    state: {
      init(stateConfig: EditorStateConfig, state: EditorState) {
        const { doc, schema } = state;
        const activeRanges = activeIn(
          state,
          expect(
            'the datastore plugin is required for this plugin',
            datastoreKey.getState(state)
          )
        );
        return {
          highlights: calculateDecorations(schema, doc, activeRanges),
          activeRanges,
        };
      },
      apply(tr, set, oldState, newState) {
        const { doc, schema } = newState;
        const activeRanges = activeIn(
          newState,
          expect(
            'the datastore plugin is required for this plugin',
            datastoreKey.getState(newState)
          )
        );
        return {
          highlights: calculateDecorations(schema, doc, activeRanges),
          activeRanges,
        };
      },
    },
    props: {
      decorations(state): DecorationSet | undefined {
        return citation.getState(state)?.highlights;
      },
    },
  });
  return citation;
}

function defaultActiveIn(
  state: EditorState,
  datastore: ProseStore
): [number, number][] {
  const result: [number, number][] = [];
  for (const { node, pos } of datastore
    .match(null, 'besluit:motivering')
    .asPredicateNodeMapping()
    .nodes()) {
    const startPos = unwrapOr(0, pos?.pos);
    result.push([startPos, startPos + node.nodeSize]);
  }
  return result;
}

export interface CitationPluginBundle {
  plugin: ProsePlugin<CitationPluginState>;
  widgets: {
    citationCard: WidgetSpec;
    citationInsert: WidgetSpec;
  };
  marks: {
    citation: MarkSpec;
  };
}

export interface CitationPluginConfig {
  activeIn?(state: EditorState, datastore: ProseStore): [number, number][];
}

export function setupCitationPlugin(
  config: CitationPluginConfig = {}
): CitationPluginBundle {
  const plugin = citationPlugin(config);
  return {
    plugin,
    widgets: {
      citationCard: {
        desiredLocation: 'sidebar',
        componentName: 'citation-plugin/citation-card',
        widgetArgs: {
          plugin,
        },
      },
      citationInsert: {
        desiredLocation: 'insertSidebar',
        componentName: 'citation-plugin/citation-insert',
        widgetArgs: {
          plugin,
        },
      },
    },
    marks: {
      citation,
    },
  };
}
