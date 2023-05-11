import Controller from '@ember/controller';
import applyDevTools from 'prosemirror-dev-tools';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { SayController } from '@lblod/ember-rdfa-editor';
import { Schema, Plugin } from '@lblod/ember-rdfa-editor';
import {
  em,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  block_rdfa,
  hard_break,
  invisible_rdfa,
  paragraph,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';

import { service } from '@ember/service';
import ImportRdfaSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/services/import-rdfa-snippet';
import { NodeViewConstructor } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import {
  variable,
  variableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/nodes';
import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import date from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin/nodes/date';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
  space,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import {
  STRUCTURE_NODES,
  STRUCTURE_VIEWS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structured-blocks-plugin';
export default class StructuredBlocksSampleController extends Controller {
  @service declare importRdfaSnippet: ImportRdfaSnippet;
  @service declare intl: IntlService;
  @tracked controller?: SayController;

  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
    say: 'https://say.data.gift/ns/',
  };

  get schema() {
    return new Schema({
      nodes: {
        doc: {
          content: 'structure_title+',
        },
        ...STRUCTURE_NODES,
        paragraph,
        list_item,
        ordered_list,
        bullet_list,
        ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
        date: date(this.config.date),
        variable,
        heading,
        blockquote,
        code_block,
        text,
        image,
        hard_break,
        block_rdfa,
        invisible_rdfa,
        link: link(this.config.link),
      },
      marks: {
        em,
        strong,
        underline,
        strikethrough,
      },
    });
  }

  get config() {
    return {
      date: {
        placeholder: {
          insertDate: this.intl.t('date-plugin.insert.date'),
          insertDateTime: this.intl.t('date-plugin.insert.datetime'),
        },
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
      },
      variable: {
        defaultEndpoint: 'https://dev.roadsigns.lblod.info/sparql',
      },
      link: {
        interactive: true,
      },
    };
  }

  @tracked rdfaEditor?: SayController;
  @tracked nodeViews: (
    controller: SayController
  ) => Record<string, NodeViewConstructor> = (controller) => {
    return {
      ...STRUCTURE_VIEWS(controller),
      variable: variableView(controller),
      link: linkView(this.config.link)(controller),
    };
  };
  @tracked plugins: Plugin[] = [
    tablePlugin,
    tableKeymap,
    createInvisiblesPlugin(
      [space, hardBreak, paragraphInvisible, headingInvisible],
      {
        shouldShowInvisibles: false,
      }
    ),
  ];

  @action
  rdfaEditorInit(controller: SayController) {
    this.controller = controller;
    applyDevTools(controller.mainEditorView);
    controller.setHtmlContent('');
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
