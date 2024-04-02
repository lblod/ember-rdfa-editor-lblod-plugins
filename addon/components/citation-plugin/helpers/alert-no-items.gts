import t from 'ember-intl/helpers/t';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';

<template>
  <AuAlert
    @title={{t 'citaten-plugin.alert.no-results'}}
    @skin='warning'
    @icon={{CrossIcon}}
    {{! @glint-expect-error: not typesafe yet }}
    @size={{if @fullSize undefined 'small'}}
    @closable={{false}}
    {{! @glint-expect-error: not typesafe yet }}
    class={{unless @fullSize 'au-u-margin-small'}}
    {{! @glint-expect-error: not typesafe yet }}
    ...attributes
  />
</template>
