import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import PowerSelect from 'ember-power-select/components/power-select';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { on } from '@ember/modifier';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import t from 'ember-intl/helpers/t';
import AutoResizingTextArea from '../auto-resizing-text-area';

interface Sig {
  Args: { controller: SayController; supportedTags: string[] };
}

export default class ConfigureMandateeTableComponent extends Component<Sig> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get mandateeTableNode() {
    const { mandatee_table } = this.schema.nodes;
    if (!mandatee_table) {
      return undefined;
    }
    return findParentNodeOfType(mandatee_table)(
      this.controller.activeEditorState.selection,
    );
  }

  get showCard() {
    return Boolean(this.mandateeTableNode);
  }

  get currentTag() {
    return this.mandateeTableNode?.node.attrs.tag as string | undefined;
  }

  get nodeTitle() {
    return this.mandateeTableNode?.node.attrs.title as string | undefined;
  }

  updateAttribute(key: string, value: unknown) {
    if (this.mandateeTableNode) {
      const { pos } = this.mandateeTableNode;
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, key, value);
      });
    }
  }

  @action
  updateTag(tag: string) {
    this.updateAttribute('tag', tag);
  }

  @action
  updateNodeTitle(event: InputEvent) {
    this.updateAttribute('title', (event.target as HTMLInputElement).value);
  }

  <template>
    {{#if this.showCard}}
      <AuCard
        @flex={{true}}
        @divided={{true}}
        @isOpenInitially={{true}}
        @expandable={{true}}
        @shadow={{true}}
        @size='small'
        as |c|
      >
        <c.header>
          <AuHeading @level='3' @skin='6'>
            {{t 'mandatee-table-plugin.configure.title'}}
          </AuHeading>
        </c.header>
        <c.content>
          <AuFormRow>
            <AuLabel for='mandatee-table-tag-select'>
              {{t 'mandatee-table-plugin.configure.tag-input.label'}}
            </AuLabel>
            <PowerSelect
              id='mandatee-table-tag-select'
              @allowClear={{false}}
              @searchEnabled={{false}}
              @options={{@supportedTags}}
              @selected={{this.currentTag}}
              @onChange={{this.updateTag}}
              @placeholder={{t
                'mandatee-table-plugin.configure.tag-input.placeholder'
              }}
              as |tag|
            >
              {{tag}}
            </PowerSelect>
          </AuFormRow>
          <AuFormRow>
            <AuLabel for='mandatee-table-title-input'>
              {{t 'mandatee-table-plugin.configure.title-input.label'}}
            </AuLabel>
            <AutoResizingTextArea
              @width='block'
              placeholder={{t
                'mandatee-table-plugin.configure.title-input.placeholder'
              }}
              id='mandatee-table-title-input'
              class='mandatee-table-title-input'
              {{on 'input' this.updateNodeTitle}}
            >{{this.nodeTitle}}</AutoResizingTextArea>
          </AuFormRow>
        </c.content>
      </AuCard>
    {{/if}}
  </template>
}
