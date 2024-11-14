import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { type SayController } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { v4 as uuidv4 } from 'uuid';
import IntlService from 'ember-intl/services/intl';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';

type Args = {
  controller: SayController;
};

export default class TextVariableInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label?: string;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    const mappingSubject = `http://data.lblod.info/mappings/--ref-uuid4-${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/--ref-uuid4-${uuidv4()}`;
    const variableId = uuidv4();

    const placeholder = this.intl.t('variable.text.label', {
      locale: this.documentLanguage,
    });

    const label = this.label ?? placeholder;
    const node = this.schema.nodes.text_variable.create(
      {
        subject: mappingSubject,
        rdfaNodeType: 'resource',
        __rdfaId: variableId,
        properties: [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(variableInstance),
          },
          {
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('text'),
          },
          {
            predicate: EXT('content').full,
            object: sayDataFactory.contentLiteral(),
          },
        ],
      },
      this.schema.node('placeholder', {
        placeholderText: label,
      }),
    );

    this.label = undefined;

    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }
}
