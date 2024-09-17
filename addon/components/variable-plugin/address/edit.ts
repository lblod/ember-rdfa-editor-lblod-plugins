import { action } from '@ember/object';
import Component from '@glimmer/component';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import {
  Address,
  AddressError,
  fetchMunicipalities,
  fetchStreets,
  resolveAddress,
  resolveStreet,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/address-helpers';
import { restartableTask, timeout } from 'ember-concurrency';
import { trackedReset } from 'tracked-toolbox';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';

type Args = {
  controller: SayController;
  defaultMunicipality?: string;
};

export default class AddressEditComponent extends Component<Args> {
  @service declare intl: IntlService;

  @trackedReset({
    memo: 'currentAddress',
    update(component: AddressEditComponent) {
      const { currentMunicipality } = component;
      return currentMunicipality
        ? currentMunicipality
        : component.args.defaultMunicipality;
    },
  })
  newMunicipality?: string;

  @trackedReset({
    memo: 'currentAddress',
    update(component: AddressEditComponent) {
      return component.currentStreetName;
    },
  })
  newStreetName?: string;

  @trackedReset({
    memo: 'currentAddress',
    update(component: AddressEditComponent) {
      return component.currentHousenumber;
    },
  })
  newHousenumber?: string;

  @trackedReset({
    memo: 'currentAddress',
    update(component: AddressEditComponent) {
      return component.currentBusnumber;
    },
  })
  newBusnumber?: string;

  get message() {
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

    return;
  }

  get currentAddress() {
    return this.selectedAddressVariable?.node.attrs.value as Address | null;
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
      return;
    }
  }

  get currentBusnumber() {
    if (this.currentAddress instanceof Address) {
      return this.currentAddress.busnumber;
    } else {
      return;
    }
  }

  get selectedAddressVariable() {
    const { selection, schema } = this.controller.activeEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === schema.nodes.address
    ) {
      return { node: selection.node, pos: selection.from };
    }
    return;
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

  get showCard() {
    return !!this.selectedAddressVariable;
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

  get addressToInsert() {
    if (this.newAddress.isSuccessful) {
      return this.newAddress.value;
    }

    return this.alternativeAddressFromError;
  }

  get canUpdateAddressVariable() {
    const addressToInsert = this.addressToInsert;

    if (!addressToInsert) {
      return false;
    }

    if (this.currentAddress?.sameAs(this.addressToInsert)) {
      return false;
    }

    return true;
  }

  resolveAddressTask = restartableTask(async () => {
    const { newStreetName, newMunicipality, newHousenumber, newBusnumber } =
      this;
    if (newMunicipality && newStreetName) {
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
          return resolveAddress({
            street: newStreetName,
            municipality: newMunicipality,
            housenumber: newHousenumber,
            busnumber: newBusnumber,
          });
        } else {
          return resolveStreet({
            street: newStreetName,
            municipality: newMunicipality,
          });
        }
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
  updateAddressVariable() {
    if (this.selectedAddressVariable && this.addressToInsert) {
      const { pos } = this.selectedAddressVariable;
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'value', this.addressToInsert);
      });
    }
  }

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

  get controller() {
    return this.args.controller;
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
}
