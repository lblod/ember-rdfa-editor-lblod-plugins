import { action } from '@ember/object';
import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import { trackedReset } from 'tracked-toolbox';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import type { SafeString } from '@ember/template/-private/handlebars';
import not from 'ember-truth-helpers/helpers/not';
import eq from 'ember-truth-helpers/helpers/eq';
import IntlService from 'ember-intl/services/intl';
import t from 'ember-intl/helpers/t';
import PowerSelect from 'ember-power-select/components/power-select';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuAlert, {
  type AuAlertSignature,
} from '@appuniversum/ember-appuniversum/components/au-alert';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import AuFieldset from '@appuniversum/ember-appuniversum/components/au-fieldset';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
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
import { type Point } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { type NodeContentsUtils } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node-contents';
import { type LocationType } from './map';

interface Message {
  skin: AuAlertSignature['Args']['skin'];
  icon: AuAlertSignature['Args']['icon'];
  title: string;
  body: string | SafeString;
}

type Signature = {
  Args: {
    locationType: LocationType;
    setLocationType: (type: LocationType) => void;
    defaultMunicipality?: string;
    currentAddress?: Address;
    selectedLocationNode: ResolvedPNode | null;
    setAddressToInsert: (address: Address | undefined) => void;
    setIsLoading?: (isLoading: boolean) => void;
    placeName?: string;
    setPlaceName: (name: string) => void;
    nodeContentsUtils: NodeContentsUtils;
  };
  Element: HTMLFormElement;
};

export default class LocationPluginEditComponent extends Component<Signature> {
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
        title: this.intl.t('location-plugin.search.success.address-found'),
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
            'location-plugin.search.errors.address-not-found-short',
          ),
          body: this.intl.t(
            'location-plugin.search.errors.alternative-address',
            { address: this.newAddress.error.alternativeAddress.formatted },
          ),
        };
      }

      return {
        skin: 'warning',
        icon: AlertTriangleIcon,
        title: this.intl.t(error.translation, {
          status: error.status,
          coords: error.coords,
        }),
        body: this.intl.t('location-plugin.search.errors.contact', {
          htmlSafe: true,
          email: 'gelinktnotuleren@vlaanderen.be',
        }),
      };
    }

    return undefined;
  }

  get currentAddress() {
    const currentLocation = this.args.selectedLocationNode?.value.attrs
      .value as Address | Point | null;
    return currentLocation && currentLocation instanceof Address
      ? currentLocation
      : null;
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
      try {
        if (
          this.currentAddress?.sameAs({
            street: newStreetName,
            municipality: newMunicipality,
            busnumber: newBusnumber,
            housenumber: newHousenumber,
          })
        ) {
          return this.currentAddress;
        } else {
          await timeout(200);
          if (newHousenumber) {
            const address = await resolveAddress(
              {
                street: newStreetName,
                municipality: newMunicipality,
                housenumber: newHousenumber,
                busnumber: newBusnumber,
              },
              this.args.nodeContentsUtils,
            );
            this.args.setAddressToInsert(address);
            return address;
          } else {
            const address = await resolveStreet(
              {
                street: newStreetName,
                municipality: newMunicipality,
              },
              this.args.nodeContentsUtils,
            );
            this.args.setAddressToInsert(address);
            return address;
          }
        }
      } catch (err) {
        if (err instanceof AddressError && err.alternativeAddress) {
          this.args.setAddressToInsert(err.alternativeAddress);
        } else {
          this.args.setAddressToInsert(undefined);
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

  @action
  updatePlaceName(event: InputEvent) {
    this.args.setPlaceName((event.target as HTMLInputElement).value);
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
    <form class='au-c-form' ...attributes>
      <AuFieldset @alignment='inline' as |fs|>
        <fs.legend>
          {{t 'location-plugin.search.type'}}
        </fs.legend>
        <fs.content>
          <AuRadioGroup
            id='location-type'
            @alignment='inline'
            @selected={{@locationType}}
            @onChange={{@setLocationType}}
            as |Group|
          >
            <Group.Radio @value='address'>
              {{t 'location-plugin.types.address'}}
            </Group.Radio>
            <Group.Radio @value='place'>
              {{t 'location-plugin.types.place'}}
            </Group.Radio>
            <Group.Radio @value='area'>
              {{t 'location-plugin.types.area'}}
            </Group.Radio>
          </AuRadioGroup>
        </fs.content>
      </AuFieldset>
      {{#unless (eq @locationType 'address')}}
        <AuFormRow>
          <AuLabel for='place-name'>
            {{t 'location-plugin.search.place-name.label'}}*
          </AuLabel>
          <AuNativeInput
            id='place-name'
            placeholder={{t 'location-plugin.search.place-name.placeholder'}}
            @width='block'
            value={{@placeName}}
            {{on 'input' this.updatePlaceName}}
          />
        </AuFormRow>
        <AuHeading @level='6' @skin='6'>
          {{t 'location-plugin.search.title'}}
        </AuHeading>
        <p class='au-u-para-tiny au-u-margin-none'>
          {{t 'location-plugin.search.hint'}}
        </p>
      {{/unless}}
      <AuFormRow>
        <AuLabel for='municipality-select'>
          {{t 'location-plugin.search.municipality.label'}}
        </AuLabel>
        <PowerSelect
          id='municipality-select'
          @loadingMessage={{t 'editor-plugins.utils.loading'}}
          @searchMessage={{t
            'location-plugin.search.municipality.search-message'
          }}
          @noMatchesMessage={{t
            'location-plugin.search.municipality.no-results'
          }}
          @placeholder={{t 'location-plugin.search.municipality.placeholder'}}
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
      </AuFormRow>
      <AuFormRow>
        <AuLabel for='streetname-select'>
          {{t 'location-plugin.search.street.label'}}
        </AuLabel>
        <PowerSelect
          id='streetname-select'
          @loadingMessage={{t 'editor-plugins.utils.loading'}}
          @searchMessage={{t 'location-plugin.search.street.search-message'}}
          @noMatchesMessage={{t 'location-plugin.search.street.no-results'}}
          @placeholder={{t 'location-plugin.search.street.placeholder'}}
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
      </AuFormRow>
      <AuFormRow>
        <div class='au-o-grid au-o-grid--tiny'>
          <div
            class={{if
              (eq @locationType 'address')
              'au-o-grid__item au-u-1-2@medium'
              'au-o-grid__item'
            }}
          >
            <AuLabel for='housenumber-select'>
              {{t 'location-plugin.search.housenumber.label'}}
            </AuLabel>
            <AuNativeInput
              id='housenumber-select'
              placeholder={{t 'location-plugin.search.housenumber.placeholder'}}
              @width='block'
              value={{this.newHousenumber}}
              @disabled={{not this.canUpdateHousenumber}}
              {{on 'input' this.updateHousenumber}}
            />
          </div>
          {{#if (eq @locationType 'address')}}
            <div class='au-o-grid__item au-u-1-2@medium'>
              <AuLabel for='busnumber-select'>
                {{t 'location-plugin.search.busnumber.label'}}
              </AuLabel>
              <AuNativeInput
                id='busnumber-select'
                placeholder={{t 'location-plugin.search.busnumber.placeholder'}}
                @width='block'
                value={{this.newBusnumber}}
                @disabled={{not this.canUpdateBusnumber}}
                {{on 'input' this.updateBusnumber}}
              />
            </div>
          {{/if}}
        </div>
      </AuFormRow>

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
