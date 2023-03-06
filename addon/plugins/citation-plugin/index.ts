import {
  Decoration,
  DecorationSet,
  EditorState,
  EditorStateConfig,
  InlineDecorationSpec,
  NodeType,
  PNode,
  ProsePlugin,
  Schema,
} from '@lblod/ember-rdfa-editor';
import processMatch, {
  RegexpMatchArrayWithIndices,
} from './utils/process-match';
import { changedDescendants } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/changed-descendants';

const BASIC_MULTIPLANE_CHARACTER = '\u0021-\uFFFF'; // most of the characters used around the world

/**
 * regex for non-newline whitespace
 */
const NNWS = '[^\\S\\n]';

/**
 * match for a "decree"
 * the "t" at the end is not a typo
 */
const DECREE = `\\w*decreet`;

/**
 * literally "letter that gets sent around"
 */
const MEMO = `omzendbrief`;
const TREATY = `verdrag`;
const CONSTITUTION_CHANGE = `grondwetswijziging`;
/**
 * literally "agreement to collaborate"
 */
const COLLAB = `samenwerkingsakkoord`;
/**
 * Literally "book of law", I suppose that's called a codex?
 */
const BOOK = `\\w*wetboek`;
const PROTOCOL = `protocol`;
/**
 * match for the literal "of the flemish government"
 */
const VVR = `${NNWS}van${NNWS}de${NNWS}vlaamse${NNWS}regering`;
/**
 * match for the literal "decision of the flemish government"
 */
const FLEMGOV = `besluit${VVR}`;
/**
 * match for "coordinated laws"
 * whatever that may be
 */
const COORD = `geco[öo]rdineerde${NNWS}wet(ten)?`;
/**
 * literally "special law"
 */
const SPECIAL = `bijzondere${NNWS}wet`;
/**
 * Matches any kind of law
 */
const LAW = `\\w*wet`;
/**
 * match for the literal "royal decision"
 * "royal decree" might be a more meaningful translation to english, but don't read too much into these
 * translations anyway
 */
const ROYAL = `koninklijk${NNWS}?besluit`;
/**
 * same thing as above, but for ministers
 */
const MINISTERIAL = `ministerieel${NNWS}?besluit`;
/**
 * match for "enumerated royal decision"
 * no, we don't know the difference either
 */
const ENUM_ROYAL = `genummerd${NNWS}?${ROYAL}`;

/**
 * The type of citation that we need to search for
 */
const TYPE = `${DECREE}|${MEMO}|${TREATY}|${CONSTITUTION_CHANGE}|${COLLAB}|${BOOK}|${PROTOCOL}|${FLEMGOV}|${COORD}|${SPECIAL}|${LAW}|${ROYAL}|${MINISTERIAL}|${ENUM_ROYAL}`;
/**
 * The monster regex that makes the citation plugin trigger.
 * In restructuring, I've made sure that I didn't abstract away any of the capturing groups,
 * only their content, so you can still see what's going on
 *
 * This regex uses named capturing groups, that's the "?<name>" syntax, for easy parsing later
 */
export const CITATION_REGEX = new RegExp(
  `((?<type>${TYPE})${NNWS}*(?<searchTerms>(${NNWS}|[${BASIC_MULTIPLANE_CHARACTER};:'"()&-_]){3,})?)`,
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

export function citationPlugin(config: CitationPluginConfig): CitationPlugin {
  const citation: CitationPlugin = new ProsePlugin({
    state: {
      init(stateConfig: EditorStateConfig, state: EditorState) {
        return calculateCitationPluginState(state, config);
      },
      apply(tr, oldPluginState, oldState, newState) {
        return calculateCitationPluginState(
          newState,
          config,
          oldState,
          oldPluginState.highlights.map(tr.mapping, tr.doc)
        );
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
  oldState?: EditorState,
  oldDecs?: DecorationSet
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
      oldState?.doc,
      oldDecs
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
  oldDoc?: PNode,
  oldDecorations?: DecorationSet
): { decorations: DecorationSet; activeRanges: [number, number][] } {
  const activeRanges: [number, number][] = [];
  const decsToAdd: Decoration[] = [];
  const decsToRemove: Decoration[] = [];
  const collector = collectDecorations(
    decsToAdd,
    schema,
    config.regex,
    newDoc,
    decsToRemove,
    oldDecorations
  );
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
    decorations: oldDecorations
      ? oldDecorations.remove(decsToRemove).add(newDoc, decsToAdd)
      : DecorationSet.create(newDoc, decsToAdd),
    activeRanges,
  };
}

function calculateDecorationsInRanges(
  config: CitationPluginConfig,
  schema: CitationSchema,
  doc: PNode,
  activeRanges: [number, number][]
): { decorations: DecorationSet; activeRanges: [number, number][] } {
  const decorationsToAdd: Decoration[] = [];
  const collector = collectDecorations(
    decorationsToAdd,
    schema,
    config.regex,
    doc
  );

  for (const [start, end] of activeRanges) {
    doc.nodesBetween(start, end, collector);
  }
  return {
    decorations: DecorationSet.create(doc, decorationsToAdd),
    activeRanges: activeRanges,
  };
}

function collectDecorations(
  decsToAdd: Decoration[],
  schema: CitationSchema,
  regex: RegExp = CITATION_REGEX,
  doc: PNode,
  decsToRemove?: Decoration[],
  oldDecs?: DecorationSet
) {
  return function (node: PNode, pos: number): boolean {
    const resolvedNode = doc.resolve(pos);
    if (
      node.isText &&
      node.text &&
      !(
        resolvedNode &&
        resolvedNode.parent &&
        resolvedNode.parent.type === schema.nodes.link
      )
    ) {
      if (decsToRemove && oldDecs) {
        decsToRemove.push(
          ...oldDecs.find(
            pos,
            pos + node.nodeSize,
            (spec) =>
              (spec as Record<string, string>).name === 'citationHighlight'
          )
        );
      }

      for (const match of node.text.matchAll(regex)) {
        const processedMatch = processMatch(
          match as RegexpMatchArrayWithIndices
        );

        if (processedMatch) {
          const { text, legislationTypeUri, searchTextMatch } = processedMatch;
          const { start: matchStart, end: matchEnd } = searchTextMatch;
          const decorationStart = pos + matchStart;
          const decorationEnd = pos + matchEnd;
          decsToAdd.push(
            Decoration.inline(
              decorationStart,
              decorationEnd,

              {
                'data-editor-highlight': 'true',
              },
              {
                name: 'citationHighlight',
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
