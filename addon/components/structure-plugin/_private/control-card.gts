import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import Component from '@glimmer/component';
import { NodeType, SayController, Schema } from '@lblod/ember-rdfa-editor';
import HoverTooltip from '@lblod/ember-rdfa-editor-lblod-plugins/components/hover-tooltip';
import { findAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import t from 'ember-intl/helpers/t';

import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { not } from 'ember-truth-helpers';
import { recalculateNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/recalculate-structure-numbers';
import { moveStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/move-structure';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

interface Sig {
  Args: { controller: SayController };
}

export default class StructureControlCardComponent extends Component<Sig> {
  @service declare intl: IntlService;
  get controller(): SayController {
    return this.args.controller;
  }
  get schema(): Schema {
    return this.controller.mainEditorState.schema;
  }
  get structureType(): NodeType | undefined {
    return this.schema.nodes['structure'];
  }
  get structure(): Option<NodeWithPos> {
    const currentSelection = this.controller.mainEditorState.selection;
    if (this.structureType) {
      return findAncestorOfType(currentSelection, this.structureType) ?? null;
    }
    return null;
  }
  get structureName(): string {
    const type = this.structure?.node.attrs.structureType;
    return this.intl.t(`structure-plugin.types.${type}`) ?? 'Unknown structure';
  }
  get canMoveUp() {
    return this.controller.checkCommand(moveStructure('up'));
  }
  get canMoveDown() {
    return this.controller.checkCommand(moveStructure('down'));
  }
  @action
  moveStructure(direction: 'down' | 'up') {
    this.controller.doCommand(moveStructure(direction));
    this.controller.focus();
  }

  get canRemoveStructure() {
    return !!this.structure;
  }
  @action
  removeStructure(withContent: boolean) {
    if (this.structure) {
      const { pos, node } = this.structure;
      if (withContent) {
        this.controller.withTransaction(
          (tr, state) => {
            return transactionCombinator<boolean>(
              state,
              tr.replace(pos, pos + node.nodeSize),
              // Deleting links is taken care of in editor code, so no need to regenerate links
            )([recalculateNumbers]).transaction;
          },
          { view: this.controller.mainEditorView },
        );
      } else {
        this.controller.withTransaction(
          (tr, state) => {
            return transactionCombinator<boolean>(
              state,
              tr.replaceWith(pos, pos + node.nodeSize, node.content),
              // Deleting links is taken care of in editor code, so no need to regenerate links
            )([recalculateNumbers]).transaction;
          },
          { view: this.controller.mainEditorView },
        );
      }
    }
  }
  <template>
    {{#if this.structure}}
      <AuCard
        @flex={{true}}
        @divided={{true}}
        @expandable={{true}}
        @shadow={{true}}
        @isOpenInitially={{true}}
        @size='small'
        as |Card|
      >
        <Card.header>
          <AuHeading @level='3' @skin='6'>{{t
              'article-structure-plugin.title.structure-card'
            }}</AuHeading>
        </Card.header>
        <Card.content>
          <AuList
            @divider={{true}}
            class='au-u-padding-top-tiny au-u-padding-bottom-tiny'
            as |Item|
          >
            <Item>
              <AuButton
                @icon={{ChevronUpIcon}}
                @iconAlignment='left'
                @skin='link'
                @disabled={{not this.canMoveUp}}
                {{on 'click' (fn this.moveStructure 'up')}}
              >
                {{t
                  'structure-plugin.move-up'
                  structureName=this.structureName
                }}
              </AuButton>
            </Item>
            <Item>
              <AuButton
                @icon={{ChevronDownIcon}}
                @iconAlignment='left'
                @skin='link'
                @disabled={{not this.canMoveDown}}
                {{on 'click' (fn this.moveStructure 'down')}}
              >
                {{t
                  'structure-plugin.move-down'
                  structureName=this.structureName
                }}
              </AuButton>
            </Item>
            <Item>
              <AuButtonGroup>
                <HoverTooltip>
                  <:hover as |hover|>
                    <AuButton
                      @icon={{BinIcon}}
                      @iconAlignment='left'
                      @skin='link'
                      @alert={{true}}
                      @disabled={{not this.canRemoveStructure}}
                      aria-describedby='remove-tooltip'
                      {{hover.velcroHook}}
                      {{hover.handleHover}}
                      {{on 'click' (fn this.removeStructure false)}}
                    >
                      {{t
                        'structure-plugin.remove'
                        structureName=this.structureName
                      }}
                    </AuButton>
                  </:hover>
                  <:tooltip as |tooltip|>
                    <AuPill id='remove-tooltip' role='tooltip' {{tooltip}}>
                      {{t 'article-structure-plugin.remove.help-text'}}
                    </AuPill>
                  </:tooltip>
                </HoverTooltip>
                <HoverTooltip>
                  <:hover as |hover|>
                    <AuButton
                      @icon={{BinIcon}}
                      @iconAlignment='left'
                      @skin='link'
                      aria-describedby='remove-content-tooltip'
                      @alert={{true}}
                      {{hover.velcroHook}}
                      {{hover.handleHover}}
                      {{on 'click' (fn this.removeStructure true)}}
                    >
                      {{t
                        'structure-plugin.remove-with-content'
                        structureName=this.structureName
                      }}
                    </AuButton>
                  </:hover>
                  <:tooltip as |tooltip|>
                    <AuPill
                      id='remove-content-tooltip'
                      role='tooltip'
                      {{tooltip}}
                    >
                      {{t
                        'article-structure-plugin.remove-with-content.help-text'
                      }}
                    </AuPill>
                  </:tooltip>
                </HoverTooltip>
              </AuButtonGroup>
            </Item>
          </AuList>
        </Card.content>
      </AuCard>
    {{/if}}
  </template>
}
