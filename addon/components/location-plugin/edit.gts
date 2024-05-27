import { action } from '@ember/object';
import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import { trackedReset } from 'tracked-toolbox';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import type { SafeString } from '@ember/template/-private/handlebars';
import not from 'ember-truth-helpers/helpers/not';
import IntlService from 'ember-intl/services/intl';
import t from 'ember-intl/helpers/t';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import PowerSelect from 'ember-power-select/components/power-select';
import AuAlert, {
  type AuAlertSignature,
} from '@appuniversum/ember-appuniversum/components/au-alert';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import AuNativeInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/au-native-input';
import {
  Address,
  AddressError,
  fetchMunicipalities,
  fetchStreets,
  resolveAddress,
  resolveStreet,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';

interface Message {
  skin: AuAlertSignature['Args']['skin'];
  icon: AuAlertSignature['Args']['icon'];
  title: string;
  body: string | SafeString;
}

type Args = {
  defaultMunicipality?: string;
  selectedAddressVariable: ResolvedPNode | null;
  setAddressToInsert: (address: Address | undefined) => void;
  setIsLoading?: (isLoading: boolean) => void;
};

export default class LocationPluginEditComponent extends Component<Args> {
  @service declare intl: IntlService;

  @trackedReset({
    memo: 'currentAddress',
    update(component: LocationPluginEditComponent) {
      const { currentMunicipality } = component;
      return currentMunicipality
        ? currentMunicipality
        : component.args.defaultMunicipality;
    },
  })
  newMunicipality?: string;

  @trackedReset({
    memo: 'currentAddress',
    update(component: LocationPluginEditComponent) {
      return component.currentStreetName;
    },
  })
  newStreetName?: string;

  @trackedReset({
    memo: 'currentAddress',
    update(component: LocationPluginEditComponent) {
      return component.currentHousenumber;
    },
  })
  newHousenumber?: string;

  @trackedReset({
    memo: 'currentAddress',
    update(component: LocationPluginEditComponent) {
      return component.currentBusnumber;
    },
  })
  newBusnumber?: string;

  get message(): Message | undefined {
    const value = this.newAddress.value as Address | undefined;

    if (
      this.newAddress.isSuccessful &&
      value &&
      !value.sameAs(this.currentAddress)
    ) {
      return {
        skin: 'success',
        icon: CheckIcon,
        title: this.intl.t('editor-plugins.address.edit.success.address-found'),
        body: value.formatted,
      };
    }

    if (
      this.newAddress.isError &&
      this.newAddress.error instanceof AddressError
    ) {
      const { error } = this.newAddress;

      if (this.newAddress.error.alternativeAddress) {
        return {
          skin: 'warning',
          icon: AlertTriangleIcon,
          title: this.intl.t(
            'editor-plugins.address.edit.errors.address-not-found-short',
          ),
          body: this.intl.t(
            'editor-plugins.address.edit.errors.alternative-address',
            { address: this.newAddress.error.alternativeAddress.formatted },
          ),
        };
      }

      return {
        skin: 'warning',
        icon: AlertTriangleIcon,
        title: this.intl.t(error.translation, { status: error.status }),
        body: this.intl.t('editor-plugins.address.edit.errors.contact', {
          htmlSafe: true,
          email: 'gelinktnotuleren@vlaanderen.be',
        }),
      };
    }

    return undefined;
  }

  get currentAddress() {
    return this.args.selectedAddressVariable?.value.attrs
      .value as Address | null;
  }

  get currentMunicipality() {
    return this.currentAddress?.municipality;
  }

  get currentStreetName() {
    return this.currentAddress?.street;
  }

  get currentHousenumber() {
    if (this.currentAddress instanceof Address) {
      return this.currentAddress.housenumber;
    } else {
      return undefined;
    }
  }

  get currentBusnumber() {
    if (this.currentAddress instanceof Address) {
      return this.currentAddress.busnumber;
    } else {
      return undefined;
    }
  }

  get canUpdateStreet() {
    return !!this.newMunicipality;
  }

  get canUpdateHousenumber() {
    return this.newMunicipality && this.newStreetName;
  }

  get canUpdateBusnumber() {
    return this.newMunicipality && this.newStreetName && this.newHousenumber;
  }

  get alternativeAddressFromError() {
    if (
      this.newAddress.isError &&
      this.newAddress.error instanceof AddressError &&
      this.newAddress.error.alternativeAddress
    ) {
      return this.newAddress.error.alternativeAddress;
    }

    return undefined;
  }

  resolveAddressTask = restartableTask(async () => {
    const { newStreetName, newMunicipality, newHousenumber, newBusnumber } =
      this;
    if (
      this.currentAddress &&
      newStreetName === this.currentAddress.street &&
      newMunicipality === this.currentAddress.municipality &&
      newHousenumber === this.currentAddress.housenumber &&
      newBusnumber === this.currentAddress.busnumber
    ) {
      // No need to re-search, nothing has changed
      return;
    }
    if (newMunicipality && newStreetName) {
      this.args.setIsLoading?.(true);
      this.args.setAddressToInsert(undefined);
      try {
        if (
          this.currentAddress?.sameAs({
            street: newStreetName,
            municipality: newMunicipality,
            busnumber: newBusnumber,
            housenumber: newHousenumber,
          })
        ) {
          this.args.setAddressToInsert(this.currentAddress);
          return this.currentAddress;
        } else {
          await timeout(200);
          if (newHousenumber) {
            const address = await resolveAddress({
              street: newStreetName,
              municipality: newMunicipality,
              housenumber: newHousenumber,
              busnumber: newBusnumber,
            });
            this.args.setAddressToInsert(address);
            return address;
          } else {
            const address = await resolveStreet({
              street: newStreetName,
              municipality: newMunicipality,
            });
            this.args.setAddressToInsert(address);
            return address;
          }
        }
      } catch (err) {
        if (err instanceof AddressError && err.alternativeAddress) {
          this.args.setAddressToInsert(err.alternativeAddress);
        }
        throw err;
      } finally {
        this.args.setIsLoading?.(false);
      }
    } else {
      return;
    }
  });

  newAddress = trackedTask<Address | undefined>(
    this,
    this.resolveAddressTask,
    () => [
      this.newMunicipality,
      this.newStreetName,
      this.newHousenumber,
      this.newBusnumber,
    ],
  );

  @action
  selectMunicipality(municipality: string) {
    this.newMunicipality = municipality;
    this.newStreetName = '';
    this.newHousenumber = '';
    this.newBusnumber = '';
  }

  @action
  selectStreet(street: string) {
    this.newStreetName = street;
    this.newHousenumber = '';
    this.newBusnumber = '';
  }

  @action
  updateHousenumber(event: InputEvent) {
    this.newHousenumber = (event.target as HTMLInputElement).value;
    this.newBusnumber = '';
  }

  @action
  updateBusnumber(event: InputEvent) {
    this.newBusnumber = (event.target as HTMLInputElement).value;
  }

  searchMunicipality = restartableTask(async (term: string) => {
    await timeout(200);
    return fetchMunicipalities(term);
  });

  searchStreet = restartableTask(async (term: string) => {
    if (this.newMunicipality) {
      await timeout(200);
      const streets = await fetchStreets(term, this.newMunicipality);
      return streets;
    } else {
      return [];
    }
  });

  <template>
    <form class='au-c-form'>
      <AuLabel for='municipality-select'>
        {{t 'editor-plugins.address.edit.municipality.label'}}*
      </AuLabel>
      <PowerSelect
        id='municipality-select'
        @loadingMessage={{t 'editor-plugins.utils.loading'}}
        @searchMessage={{t
          'editor-plugins.address.edit.municipality.search-message'
        }}
        @noMatchesMessage={{t
          'editor-plugins.address.edit.municipality.no-results'
        }}
        @placeholder={{t
          'editor-plugins.address.edit.municipality.placeholder'
        }}
        @allowClear={{true}}
        @renderInPlace={{true}}
        @searchEnabled={{true}}
        @search={{perform this.searchMunicipality}}
        @selected={{this.newMunicipality}}
        @onChange={{this.selectMunicipality}}
        as |municipality|
      >
        {{municipality}}
      </PowerSelect>
      <AuLabel for='streetname-select'>
        {{t 'editor-plugins.address.edit.street.label'}}*
      </AuLabel>
      <PowerSelect
        id='streetname-select'
        @loadingMessage={{t 'editor-plugins.utils.loading'}}
        @searchMessage={{t 'editor-plugins.address.edit.street.search-message'}}
        @noMatchesMessage={{t 'editor-plugins.address.edit.street.no-results'}}
        @placeholder={{t 'editor-plugins.address.edit.street.placeholder'}}
        @allowClear={{true}}
        @renderInPlace={{true}}
        @searchEnabled={{true}}
        @search={{perform this.searchStreet}}
        @selected={{this.newStreetName}}
        @disabled={{not this.canUpdateStreet}}
        @onChange={{this.selectStreet}}
        as |street|
      >
        {{street}}
      </PowerSelect>
      <div class='au-o-grid au-o-grid--tiny'>
        <div class='au-o-grid__item au-u-1-2@medium'>
          <AuLabel for='housenumber-select'>
            {{t 'editor-plugins.address.edit.housenumber.label'}}
          </AuLabel>
          <AuNativeInput
            id='housenumber-select'
            placeholder={{t
              'editor-plugins.address.edit.housenumber.placeholder'
            }}
            @width='block'
            value={{this.newHousenumber}}
            @disabled={{not this.canUpdateHousenumber}}
            {{on 'input' this.updateHousenumber}}
          />
        </div>
        <div class='au-o-grid__item au-u-1-2@medium'>
          <AuLabel for='busnumber-select'>
            {{t 'editor-plugins.address.edit.busnumber.label'}}
          </AuLabel>
          <AuNativeInput
            id='busnumber-select'
            placeholder={{t
              'editor-plugins.address.edit.busnumber.placeholder'
            }}
            @width='block'
            value={{this.newBusnumber}}
            @disabled={{not this.canUpdateBusnumber}}
            {{on 'input' this.updateBusnumber}}
          />
        </div>
      </div>

      {{#if this.message}}
        <AuAlert
          @skin={{this.message.skin}}
          @icon={{this.message.icon}}
          @title={{this.message.title}}
        >
          {{this.message.body}}
        </AuAlert>
      {{/if}}
    </form>
  </template>
}
