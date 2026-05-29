import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuNativeInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/au-native-input';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { type LocationPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { tracked } from '@glimmer/tracking';

interface Signature {
  Args: {
    controller: SayController;
    config: LocationPluginConfig;
    templateMode?: boolean;
  };
  Element: HTMLLIElement;
}

export default class LockedPlaceholderPluginInsert extends Component<Signature> {
  @tracked key: string | null = null;
  @tracked label: string | null = null;
  @tracked type = 'inline';
  get selectedPlaceholderNode() {
    const { selection, schema } = this.controller.activeEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === schema.nodes.placeholder
    ) {
      return selection.node;
    } else {
      return;
    }
  }

  get controller() {
    return this.args.controller;
  }

  get canInsert() {
    return !this.selectedPlaceholderNode;
  }

  @action
  insertPlaceholder() {
    let node = 'inline_locked_placeholder';
    if (this.type === 'block') {
      node = 'block_locked_placeholder';
    }
    this.controller.withTransaction((tr) => {
      tr.replaceSelectionWith(
        this.controller.schema.node(node, {
          key: this.key,
          label: this.label,
        }),
      );
      if (tr.selection.$anchor.nodeBefore) {
        const resolvedPos = tr.doc.resolve(
          tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
        );
        tr.setSelection(new NodeSelection(resolvedPos));
      }
      return tr;
    });
    this.type = 'inline';
    this.key = null;
    this.label = null;
  }

  @action
  updateKey(event: InputEvent) {
    this.key = (event.target as HTMLInputElement).value;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  updateType(type: string) {
    this.type = type;
  }

  <template>
    <AuCard
      @flex={{true}}
      @divided={{true}}
      @isOpenInitially={{true}}
      @expandable={{true}}
      @shadow={{true}}
      @size='small'
      {{! @glint-ignore: backwards compat for au v3}}
      @disableAuContent={{true}}
      as |c|
    >
      <c.header>
        <AuHeading @level='3' @skin='6'>
          {{t 'locked-placeholder-plugin.insert-title'}}
        </AuHeading>
      </c.header>
      <c.content>
        <AuContent>
          <AuFormRow>
            <AuLabel for='key'>
              {{t 'locked-placeholder-plugin.key'}}
            </AuLabel>
            <AuNativeInput
              id='key'
              placeholder={{t 'locked-placeholder-plugin.keyPlaceholder'}}
              @type='text'
              @width='block'
              value={{this.key}}
              {{on 'input' this.updateKey}}
            />
          </AuFormRow>
          <AuFormRow>
            <AuLabel for='label'>
              {{t 'locked-placeholder-plugin.label'}}
            </AuLabel>
            <AuNativeInput
              id='label'
              placeholder={{t 'locked-placeholder-plugin.labelPlaceholder'}}
              @type='text'
              @width='block'
              value={{this.label}}
              {{on 'input' this.updateLabel}}
            />
          </AuFormRow>
          <AuFormRow>
            <AuLabel for='type'>
              {{t 'locked-placeholder-plugin.type'}}
            </AuLabel>
            <AuRadioGroup
              @name='zonal'
              @selected={{this.type}}
              @onChange={{this.updateType}}
              as |Group|
            >
              <Group.Radio @value='inline'>{{t
                  'locked-placeholder-plugin.inline'
                }}</Group.Radio>
              <Group.Radio @value='block'>
                {{t 'locked-placeholder-plugin.block'}}
              </Group.Radio>
            </AuRadioGroup>
          </AuFormRow>
          <AuButton {{on 'click' this.insertPlaceholder}}>
            {{t 'locked-placeholder-plugin.button'}}
          </AuButton>
        </AuContent>
      </c.content>
    </AuCard>
  </template>
}
