import sinon from 'sinon';
import type Owner from '@ember/owner';
import {
  blockRdfaWithConfig,
  docWithConfig,
  hard_break,
  horizontal_rule,
  invisibleRdfaWithConfig,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  bulletListWithConfig,
  bullet_list_input_rule,
  listItemWithConfig,
  orderedListWithConfig,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import {
  em,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  inputRules,
  type PluginConfig,
  SayController,
  Schema,
} from '@lblod/ember-rdfa-editor';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
  space,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import { editableNodePlugin } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import { link } from '@lblod/ember-rdfa-editor/nodes/link';

import { table_of_contents } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/nodes';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import {
  codelist,
  location,
  number,
  text_variable,
  address,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { templateComment } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import { date } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/date';
import { redacted } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/confidentiality-plugin/marks/redacted';
import { inlineRdfaWithConfig } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { structureWithConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';

export const SAMPLE_SCHEMA = new Schema({
  nodes: {
    doc: docWithConfig({
      content: 'table_of_contents? document_title? block+',
      rdfaAware: true,
    }),
    paragraph,
    document_title,
    repaired_block: repairedBlockWithConfig({ rdfaAware: true }),
    list_item: listItemWithConfig({}),
    ordered_list: orderedListWithConfig({}),
    bullet_list: bulletListWithConfig({}),
    templateComment,
    placeholder,
    ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
    date: date({
      formats: [
        {
          key: 'short',
          dateFormat: 'dd/MM/yy',
          dateTimeFormat: 'dd/MM/yy HH:mm',
        },
        {
          key: 'long',
          dateFormat: 'EEEE dd MMMM yyyy',
          dateTimeFormat: 'PPPPp',
        },
      ],
      allowCustomFormat: true,
    }),
    text_variable,
    number,
    location,
    codelist,
    address,
    structure: structureWithConfig(),
    heading: headingWithConfig({ rdfaAware: false }),
    blockquote,
    horizontal_rule,
    code_block,
    text,
    image,
    hard_break,
    block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
    inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
    table_of_contents: table_of_contents([
      {
        nodeHierarchy: [
          'title|chapter|section|subsection|article',
          'structure_header|article_header',
        ],
        scrollContainer: () =>
          document.getElementsByClassName(
            'say-container__main',
          )[0] as HTMLElement,
      },
    ]),
    invisible_rdfa: invisibleRdfaWithConfig({ rdfaAware: true }),
    link: link({ interactive: true }),
  },
  marks: {
    em,
    strong,
    underline,
    strikethrough,
    redacted,
  },
});
export const SAMPLE_PLUGINS: PluginConfig = [
  firefoxCursorFix(),
  chromeHacksPlugin(),
  lastKeyPressedPlugin,
  tablePlugin,
  tableKeymap,
  createInvisiblesPlugin(
    [space, hardBreak, paragraphInvisible, headingInvisible],
    {
      shouldShowInvisibles: false,
    },
  ),
  inputRules({
    rules: [
      bullet_list_input_rule(SAMPLE_SCHEMA.nodes.bullet_list),
      ordered_list_input_rule(SAMPLE_SCHEMA.nodes.ordered_list),
    ],
  }),
  editableNodePlugin(),
];

export function testEditor(
  schema: Schema,
  plugins: PluginConfig,
): { editor: SayEditor; controller: SayController } {
  const mockOwner: Owner = {
    factoryFor: sinon.fake(),
    lookup: sinon.fake(),
    register: sinon.fake(),
  };
  const element = document.createElement('div');
  const editor = new SayEditor({
    owner: mockOwner,
    target: element,
    baseIRI: 'http://test.org',
    schema,
    plugins,
  });
  const controller = new SayController(editor);
  return { editor, controller };
}
