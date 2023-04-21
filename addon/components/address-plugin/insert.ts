import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { tracked } from 'tracked-built-ins';
import { restartableTask, task, timeout } from 'ember-concurrency';

import { AddressSuggestion } from './types';
import { getAddressMatch, getSuggestedLocations } from './utils';

type Args = {
  controller: SayController;
  options: {
    endpoint: string;
  };
};

export default class AddressPluginInsertComponent extends Component<Args> {
  @tracked modalOpen = false;
  @tracked isSelectingAddress = false;

  @tracked addressSuggestions: AddressSuggestion[] = [];
  @tracked selectedAddress: AddressSuggestion | null = null;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  openModal() {
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
    this.selectedAddress = null;
  }

  @action
  selectAddress(selection: AddressSuggestion) {
    this.selectedAddress = selection;
  }

  get canInsertAddress() {
    if (this.isSelectingAddress) {
      return false;
    }

    if (!this.selectedAddress) {
      return false;
    }

    return true;
  }

  insertAddress = task(async () => {
    if (this.selectedAddress) {
      this.isSelectingAddress = true;

      const addresses = await getAddressMatch({
        housenumber: this.selectedAddress.Housenumber,
        municipality: this.selectedAddress.Municipality,
        street: this.selectedAddress.Thoroughfarename,
        zipcode: this.selectedAddress.Zipcode,
      });

      const address = addresses[0];

      this.controller.withTransaction((tr) => {
        tr.replaceSelectionWith(
          this.schema.node(
            'block_rdfa',
            {
              typeof: 'https://data.vlaanderen.be/ns/adres#Adres',
              resource: address.identificator.id,
            },
            this.schema.node('paragraph', null, [
              this.schema.text(address.volledigAdres.geografischeNaam.spelling),
            ])
          )
        );

        return tr;
      });

      this.closeModal();
      this.selectedAddress = null;
      this.isSelectingAddress = false;
    }
  });

  searchAddress = restartableTask(async (term: string) => {
    await timeout(400);

    const locations = await getSuggestedLocations(term);

    return locations;
  });
}
