import Mark from '@lblod/ember-rdfa-editor/components/toolbar/mark';
import t from 'ember-intl/helpers/t';
import { NotVisibleIcon } from '@appuniversum/ember-appuniversum/components/icons/not-visible';

<template>
  <Mark
    @icon={{NotVisibleIcon}}
    @title={{t 'confidentiality-plugin.redact'}}
    @mark='redacted'
    {{! @glint-expect-error: not typesafe yet }}
    @controller={{@controller}}
  />
</template>
