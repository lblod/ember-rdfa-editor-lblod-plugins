import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import HoverTooltip from '@lblod/ember-rdfa-editor-lblod-plugins/components/hover-tooltip';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import Component from '@glimmer/component';
import { NodeType, SayController, Schema } from '@lblod/ember-rdfa-editor';
import { findAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import t from 'ember-intl/helpers/t';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';

import { fn } from '@ember/helper';
import { not } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
interface Sig {
  Args: { controller: SayController };
}
export default class StructureControlCardComponent extends Component<Sig> {
  get controller(): SayController {
    return this.args.controller;
  }
  get schema(): Schema {
    return this.controller.activeEditorState.schema;
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
  get canMoveUp() {
    return true;
  }
  get canMoveDown() {
    return true;
  }
  @action
  moveStructure() {}

  get canRemoveStructure() {
    return true;
  }
  @action
  removeStructure() {}
  <template>
    {{#if this.structure}}
      <AuCard
        @flex={{true}}
        @divided={{true}}
        @expandable={{false}}
        @shadow={{true}}
        @size='flush'
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
                {{t 'article-structure-plugin.move-up.article'}}
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
                {{t 'article-structure-plugin.move-down.article'}}
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
                      {{t 'article-structure-plugin.remove.article'}}
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
                        'article-structure-plugin.remove-with-content.article'
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
