import Controller from '@ember/controller';
import applyDevTools from 'prosemirror-dev-tools';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import {
  NodeType,
  NodeViewConstructor,
  Plugin,
  SayController,
  Schema,
} from '@lblod/ember-rdfa-editor';
import {
  em,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';

import {
  block_rdfa,
  doc,
  hard_break,
  horizontal_rule,
  invisible_rdfa,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';

import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';
import { service } from '@ember/service';
import importRdfaSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/services/import-rdfa-snippet';
import {
  besluitNodes,
  structureSpecs,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import sampleData from '@lblod/ember-rdfa-editor/config/sample-data';
import IntlService from 'ember-intl/services/intl';
import {
  variable,
  variableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/nodes';
import { roadsign_regulation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/nodes';
import {
  date,
  dateView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin/nodes/date';
import {
  citationPlugin,
  CitationPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import {
  validation,
  ValidationReport,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';
import {
  insertArticleContainer,
  insertDescription,
  insertMotivation,
  insertTitle,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';

import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
  space,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';

import { atLeastOneArticleContainer } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/utils/validation-rules';

export default class BesluitSampleController extends Controller {
  @service declare importRdfaSnippet: importRdfaSnippet;
  @service declare intl: IntlService;
  @tracked controller?: SayController;
  @tracked citationPlugin = citationPlugin(
    this.config.citation as CitationPluginConfig
  );
  @tracked validationPlugin = validation((schema: Schema) => ({
    shapes: [
      atLeastOneArticleContainer(schema),
      {
        name: 'exactly-one-title',
        focusNodeType: schema.nodes.besluit,
        path: ['besluit_title'],
        message: 'Document must contain exactly one title block.',
        constraints: {
          minCount: 1,
          maxCount: 1,
        },
      },
      {
        name: 'exactly-one-description',
        focusNodeType: schema.nodes.besluit,
        path: ['description'],
        message: 'Document must contain exactly one description block.',
        constraints: {
          minCount: 1,
          maxCount: 1,
        },
      },
      {
        name: 'max-one-motivation',
        focusNodeType: schema.nodes.besluit,
        path: ['motivering'],
        message: 'Document may not contain more than one motivation block.',
        constraints: {
          maxCount: 1,
        },
      },
    ],
  }));

  get report(): ValidationReport {
    if (!this.controller) {
      return { conforms: true };
    }
    const validationState = this.validationPlugin.getState(
      this.controller.mainEditorState
    );
    if (!validationState) {
      return { conforms: true };
    }
    return validationState.report;
  }

  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
    say: 'https://say.data.gift/ns/',
  };

  get schema() {
    return new Schema({
      nodes: {
        doc,
        paragraph,

        repaired_block,

        list_item,
        ordered_list,
        bullet_list,
        placeholder,
        ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
        date: date(this.config.date),
        variable,
        ...besluitNodes,
        roadsign_regulation,
        heading,
        blockquote,

        horizontal_rule,
        code_block,

        text,

        image,

        hard_break,
        block_rdfa,
        invisible_rdfa,
        link: link(this.config.link),
      },
      marks: {
        inline_rdfa,
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
      structures: structureSpecs,
      citation: {
        type: 'nodes',
        activeInNodeTypes(schema: Schema): Set<NodeType> {
          return new Set<NodeType>([schema.nodes.motivering]);
        },
        endpoint: 'https://codex.opendata.api.vlaanderen.be:8888/sparql',
      },
      roadsignRegulation: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
        imageBaseUrl: 'https://register.mobiliteit.vlaanderen.be/',
      },
      besluitType: {
        endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
      },
      templateVariable: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
        zonalLocationCodelistUri:
          'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
        nonZonalLocationCodelistUri:
          'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
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
      variable: variableView(controller),
      link: linkView(this.config.link)(controller),
      date: dateView(this.config.date)(controller),
    };
  };
  @tracked plugins: Plugin[] = [
    tablePlugin,
    tableKeymap,
    this.citationPlugin,
    this.validationPlugin,
    createInvisiblesPlugin(
      [space, hardBreak, paragraphInvisible, headingInvisible],
      {
        shouldShowInvisibles: false,
      }
    ),
  ];

  @action
  setPrefixes(element: HTMLElement) {
    element.setAttribute('prefix', this.prefixToAttrString(this.prefixes));
  }

  prefixToAttrString(prefix: Record<string, string>) {
    let attrString = '';
    Object.keys(prefix).forEach((key) => {
      const uri = unwrap(prefix[key]);
      attrString += `${key}: ${uri} `;
    });
    return attrString;
  }

  @action
  async rdfaEditorInit(controller: SayController) {
    this.controller = controller;
    applyDevTools(controller.mainEditorView);
    await this.importRdfaSnippet.downloadSnippet({
      omitCredentials: 'true',
      source:
        'https://dev.kleinbord.lblod.info/snippets/example-opstellingen.html',
      mock: 'true',
    });
    const presetContent =
      localStorage.getItem('EDITOR_CONTENT') ?? sampleData.DecisionTemplate;

    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  get canInsertDescription() {
    return this.controller?.checkCommand(
      insertDescription({
        placeholderText: 'Geef korte beschrijving op',
        validateShapes: new Set(['exactly-one-description']),
      })
    );
  }

  @action
  insertDescription() {
    this.controller?.doCommand(
      insertDescription({ placeholderText: 'Geef korte beschrijving op' })
    );
    this.controller?.focus();
  }

  get canInsertTitle() {
    return this.controller?.checkCommand(
      insertTitle({
        placeholderText: 'Geef titel besluit op',
        validateShapes: new Set(['exactly-one-title']),
      })
    );
  }

  @action
  insertTitle() {
    this.controller?.doCommand(
      insertTitle({
        placeholderText: 'Geef titel besluit op',
        validateShapes: new Set(['exactly-one-title']),
      })
    );
    this.controller?.focus();
  }

  get canInsertMotivation() {
    return this.controller?.checkCommand(
      insertMotivation({
        intl: this.intl,
        validateShapes: new Set(['max-one-motivation']),
      })
    );
  }

  @action
  insertMotivation() {
    this.controller?.doCommand(
      insertMotivation({
        intl: this.intl,
      })
    );
    this.controller?.focus();
  }

  get canInsertContainer() {
    return this.controller?.checkCommand(
      insertArticleContainer({ intl: this.intl })
    );
  }

  @action
  insertArticleContainer() {
    this.controller?.doCommand(insertArticleContainer({ intl: this.intl }));
    this.controller?.focus();
  }
}
