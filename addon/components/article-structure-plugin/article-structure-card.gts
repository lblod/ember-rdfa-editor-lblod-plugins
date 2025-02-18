import Component from '@glimmer/component';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { SayController } from '@lblod/ember-rdfa-editor';
import { insertStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/commands/insert-structure';
import {
  type StructurePluginOptions,
  type StructureType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/structure-types';

type Args = {
  controller: SayController;
  options: StructurePluginOptions;
};

export default class EditorPluginsArticleStructureCardComponent extends Component<Args> {
  @service declare intl: IntlService;

  get structureTypes(): StructureType[] {
    return [
      'title',
      'chapter',
      'section',
      'subsection',
      'article',
      'paragraph',
    ];
  }

  get controller() {
    return this.args.controller;
  }
  get uriGenerator() {
    return this.args.options.uriGenerator ?? 'uuid4';
  }

  getTranslationKey = (type: StructureType) =>
    `article-structure-plugin.insert.${type}`;

  @action
  insertStructure(type: StructureType) {
    this.args.controller.doCommand(insertStructure(type, this.uriGenerator), {
      view: this.controller.mainEditorView,
    });
    this.args.controller.focus();
  }

  canInsertStructure = (type: StructureType) =>
    this.args.controller.checkCommand(
      insertStructure(type, this.uriGenerator),
      {
        view: this.controller.mainEditorView,
      },
    );

  <template>
    <div>
      {{#each this.structureTypes as |structureType|}}
        <li class='au-c-list__item'>
          <AuButton
            @icon={{AddIcon}}
            @iconAlignment='left'
            @skin='link'
            @disabled={{not (this.canInsertStructure structureType)}}
            {{on 'click' (fn this.insertStructure structureType)}}
          >
            {{t (this.getTranslationKey structureType)}}
          </AuButton>
        </li>
      {{/each}}
    </div>
  </template>
}
