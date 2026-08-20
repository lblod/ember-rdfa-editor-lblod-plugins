import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import AuAlert, {
  AuAlertSignature,
} from '@appuniversum/ember-appuniversum/components/au-alert';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { MailIcon } from '@appuniversum/ember-appuniversum/components/icons/mail';

function errorMessage(err: unknown): string {
  if (!err) return 'Error';
  if (typeof err !== 'object') return JSON.stringify(err);
  return (
    ('message' in err && (err?.message as string)) ||
    // getPromiseState includes the original error, so try to use that to avoid their generic error
    ('original' in err && (err?.original as Error | undefined)?.message) ||
    // getPromiseState 'Error's use 'reason' in place of 'message' for some reason
    ('reason' in err && (err?.reason as string)) ||
    err?.toString?.() ||
    'Error'
  );
}

interface Sig {
  Args: {
    error: unknown;
    fullSize?: boolean;
  };
  Element: AuAlertSignature['Element'];
}

const AlertLoadError: TemplateOnlyComponent<Sig> = <template>
  <AuAlert
    @title={{t 'common.search.error-title'}}
    @skin='error'
    @icon={{AlertTriangleIcon}}
    @closable={{false}}
    @size={{if @fullSize undefined 'small'}}
    class='au-u-margin'
    ...attributes
  >
    <p>{{t 'common.search.error-intro'}}</p>
    <code class='au-u-error error-code'>{{errorMessage @error}}</code>
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
</template>;

export default AlertLoadError;
