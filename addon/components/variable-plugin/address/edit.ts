import { action } from '@ember/object';
import Component from '@glimmer/component';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import {
  AddressError,
  fetchMunicipalities,
  fetchStreets,
  resolveAddress,
  resolveStreet,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/address-helpers';
import { restartableTask, timeout } from 'ember-concurrency';
import { localCopy, trackedReset } from 'tracked-toolbox';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller: SayController;
  defaultMunicipality?: string;
};

export default class AddressEditComponent extends Component<Args> {
  @service declare intl: IntlService;

  @trackedReset<AddressEditComponent, string | undefined>({
    memo: 'currentAddress',
    update(component) {
      const { currentMunicipality } = component;
      return currentMunicipality
        ? currentMunicipality
        : component.args.defaultMunicipality;
    },
  })
  newMunicipality?: string;

  @localCopy('currentStreetName') newStreetName?: string;

  @localCopy('currentHousenumber') newHousenumber?: string;

  @localCopy('currentBusnumber') newBusnumber?: string;

  get message() {
    const value = this.newAddress.value as Address | undefined;
    if (
      this.newAddress.isSuccessful &&
      value &&
      !value.sameAs(this.currentAddress)
    ) {
      return {
        skin: 'success',
        icon: 'check',
        title: this.intl.t('editor-plugins.address.edit.success.address-found'),
        body: value.formatted,
      };
    } else if (
      this.newAddress.isError &&
      this.newAddress.error instanceof AddressError
    ) {
      const { error } = this.newAddress;
      return {
        skin: 'warning',
        icon: 'alert-triangle',
        title: this.intl.t(error.translation, { status: error.status }),
        body: this.intl.t('editor-plugins.address.edit.errors.contact', {
          htmlSafe: true,
          email: 'gelinktnotuleren@vlaanderen.be',
        }),
      };
    } else {
      return;
    }
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
    const { selection, schema } = this.controller.mainEditorState;
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

  get canUpdateAddressVariable() {
    return (
      this.newAddress.isSuccessful &&
      this.newAddress.value &&
      !this.currentAddress?.sameAs(this.newAddress.value as Address)
    );
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

  newAddress = trackedTask(this, this.resolveAddressTask, () => [
    this.newMunicipality,
    this.newStreetName,
    this.newHousenumber,
    this.newBusnumber,
  ]);

  @action
  updateAddressVariable() {
    if (this.selectedAddressVariable && this.newAddress.isSuccessful) {
      const { pos } = this.selectedAddressVariable;
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'value', this.newAddress.value);
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
