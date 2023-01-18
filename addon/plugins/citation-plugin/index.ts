import {
  Decoration,
  DecorationSet,
  EditorState,
  EditorStateConfig,
  InlineDecorationSpec,
  MarkSpec,
  NodeType,
  PNode,
  ProsePlugin,
  Schema,
  WidgetSpec,
} from '@lblod/ember-rdfa-editor';
import processMatch, {
  RegexpMatchArrayWithIndices,
} from './utils/process-match';
import { citation } from './marks/citation';
import { changedDescendants } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/changed-descendants';

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

interface CitationPluginState {
  highlights: DecorationSet;
  activeRanges: [number, number][];
}

export type CitationPlugin = ProsePlugin<CitationPluginState>;

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

export interface CitationPluginNodeConfig {
  type: 'nodes';
  regex?: RegExp;

  activeInNodeTypes(schema: Schema, state: EditorState): Set<NodeType>;
}

export interface CitationPluginRangeConfig {
  type: 'ranges';
  regex?: RegExp;

  activeInRanges(state: EditorState): [number, number][];
}

export type CitationPluginConfig =
  | CitationPluginNodeConfig
  | CitationPluginRangeConfig;

export function setupCitationPlugin(
  config: CitationPluginConfig = {
    type: 'nodes',
    activeInNodeTypes(schema): Set<NodeType> {
      return new Set([schema.nodes.doc]);
    },
  }
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

function citationPlugin(config: CitationPluginConfig): CitationPlugin {
  const citation: CitationPlugin = new ProsePlugin({
    state: {
      init(stateConfig: EditorStateConfig, state: EditorState) {
        return calculateCitationPluginState(state, config);
      },
      apply(tr, set, oldState, newState) {
        return calculateCitationPluginState(newState, config, oldState);
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

function calculateCitationPluginState(
  state: EditorState,
  config: CitationPluginConfig,
  oldState?: EditorState
) {
  const { doc, schema } = state;
  let activeRanges;
  let highlights;
  if (config.type === 'ranges') {
    activeRanges = config.activeInRanges(state);
    const calculatedDecs = calculateDecorationsInRanges(
      config,
      schema,
      doc,
      activeRanges
    );
    highlights = calculatedDecs.decorations;
  } else {
    const nodes = config.activeInNodeTypes(schema, state);
    const calculatedDecs = calculateDecorationsInNodes(
      config,
      schema,
      nodes,
      doc,
      oldState?.doc
    );
    activeRanges = calculatedDecs.activeRanges;
    highlights = calculatedDecs.decorations;
  }
  return {
    highlights,
    activeRanges,
  };
}

function calculateDecorationsInNodes(
  config: CitationPluginConfig,
  schema: CitationSchema,
  nodes: Set<NodeType>,
  newDoc: PNode,
  oldDoc?: PNode
): { decorations: DecorationSet; activeRanges: [number, number][] } {
  const activeRanges: [number, number][] = [];
  const decorations: Decoration[] = [];
  const collector = collectDecorations(decorations, schema, config.regex);
  if (nodes.has(newDoc.type)) {
    oldDoc
      ? changedDescendants(oldDoc, newDoc, 0, collector)
      : newDoc.descendants(collector);
    activeRanges.push([0, newDoc.nodeSize]);
  } else {
    oldDoc
      ? changedDescendants(
          oldDoc,
          newDoc,
          0,

          (node, pos) => {
            if (nodes.has(node.type)) {
              node.nodesBetween(0, node.nodeSize - 2, collector, pos + 1);
              activeRanges.push([pos, pos + node.nodeSize]);
              return false;
            }
            return true;
          }
        )
      : newDoc.descendants((node, pos) => {
          if (nodes.has(node.type)) {
            node.nodesBetween(0, node.nodeSize - 2, collector, pos + 1);
            activeRanges.push([pos, pos + node.nodeSize]);
            return false;
          }
          return true;
        });
  }
  return {
    decorations: DecorationSet.create(newDoc, decorations),
    activeRanges,
  };
}

function calculateDecorationsInRanges(
  config: CitationPluginConfig,
  schema: CitationSchema,
  doc: PNode,
  activeRanges: [number, number][]
): { decorations: DecorationSet; activeRanges: [number, number][] } {
  const decorations: Decoration[] = [];
  const collector = collectDecorations(decorations, schema, config.regex);

  for (const [start, end] of activeRanges) {
    doc.nodesBetween(start, end, collector);
  }
  return {
    decorations: DecorationSet.create(doc, decorations),
    activeRanges: activeRanges,
  };
}

function collectDecorations(
  decorations: Decoration[],
  schema: CitationSchema,
  regex: RegExp = CITATION_REGEX
) {
  return function (node: PNode, pos: number): boolean {
    console.log('collecting from pos', pos);
    if (
      node.isText &&
      node.text &&
      !schema.marks.citation.isInSet(node.marks)
    ) {
      for (const match of node.text.matchAll(regex)) {
        const processedMatch = processMatch(
          match as RegexpMatchArrayWithIndices
        );

        if (processedMatch) {
          const { text, legislationTypeUri, searchTextMatch } = processedMatch;
          const { start: matchStart, end: matchEnd } = searchTextMatch;
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
  };
}
