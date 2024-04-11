import t from 'ember-intl/helpers/t';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { MailIcon } from '@appuniversum/ember-appuniversum/components/icons/mail';

<template>
  <AuAlert
    @title={{t 'common.search.error-title'}}
    @skin='error'
    @icon={{AlertTriangleIcon}}
    @closable={{false}}
    {{! @glint-expect-error: not typesafe yet }}
    @size={{if @fullSize undefined 'small'}}
    class='au-u-margin'
    {{! @glint-expect-error: not typesafe yet }}
    ...attributes
  >
    <p>{{t 'common.search.error-intro'}}</p>
    {{! @glint-expect-error: not typesafe yet }}
    <code class='au-u-error error-code'>{{@error}}</code>
    <p>
      {{t 'common.search.error-outro'}}
      <AuLinkExternal
        href='mailto:gelinktnotuleren@vlaanderen.be'
        @icon={{MailIcon}}
        @iconAlignment='left'
      >
        {{! template-lint-disable no-bare-strings  }}
        gelinktnotuleren@vlaanderen.be
      </AuLinkExternal>.
    </p>
  </AuAlert>
</template>
