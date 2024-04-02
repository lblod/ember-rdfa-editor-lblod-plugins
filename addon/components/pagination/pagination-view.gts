import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { NavLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-left';
import { NavRightIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-right';

<template>
  <div class='au-u-background-gray-100'>
    <AuToolbar @border='top' @size='large' @nowrap={{true}}>
      <div class='au-c-pagination'>
        <p>
          <span class='au-u-hidden-visually'>
            {{t 'pagination.results'}}</span>
          <strong>
            {{! @glint-expect-error: not typesafe yet }}
            {{@rangeStart}}
            -
            {{! @glint-expect-error: not typesafe yet }}
            {{@rangeEnd}}
          </strong>
          {{t 'pagination.of'}}
          {{! @glint-expect-error: not typesafe yet }}
          {{@totalCount}}
        </p>
        <div class='au-u-flex'>
          {{! @glint-expect-error: not typesafe yet }}
          {{#unless @isFirstPage}}
            <AuButton
              @skin='link'
              @icon={{NavLeftIcon}}
              @iconAlignment='left'
              {{! @glint-expect-error: not typesafe yet }}
              {{on 'click' @onPreviousPage}}
            >
              {{t 'pagination.previous'}}
            </AuButton>
          {{/unless}}
          {{! @glint-expect-error: not typesafe yet }}
          {{#unless @isLastPage}}
            <AuButton
              @skin='link'
              @icon={{NavRightIcon}}
              @iconAlignment='right'
              {{! @glint-expect-error: not typesafe yet }}
              {{on 'click' @onNextPage}}
            >
              {{t 'pagination.next'}}
            </AuButton>
          {{/unless}}
        </div>
      </div>
    </AuToolbar>
  </div>
</template>
