import t from 'ember-intl/helpers/t';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';

<template>
  <AuAlert
    @title={{t 'snippet-plugin.modal.alert.no-results'}}
    @skin='warning'
    @icon={{CrossIcon}}
    @closable={{false}}
    class='au-u-margin au-u-margin-top-none'
    {{! @glint-expect-error: not typesafe yet }}
    ...attributes
  />
</template>
