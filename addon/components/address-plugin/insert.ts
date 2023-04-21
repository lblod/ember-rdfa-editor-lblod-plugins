import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { tracked } from 'tracked-built-ins';
import { inject as service } from '@ember/service';
import AddressRegister, {
  AddressSuggestion,
} from '@lblod/ember-address-search';
import { restartableTask, task, timeout } from 'ember-concurrency';

type Args = {
  controller: SayController;
  options: {
    endpoint: string;
  };
};

export default class AddressPluginInsertComponent extends Component<Args> {
  @service declare addressRegister: AddressRegister;

  @tracked modalOpen = false;
  @tracked isSelectingAddress = false;

  @tracked addressSuggestions: AddressSuggestion[] = [];
  @tracked selectedAddress: AddressSuggestion | null = null;

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    this.addressRegister.setup({
      endpoint: args.options.endpoint,
    });
  }

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

      const addresses = await this.addressRegister.findAll(
        this.selectedAddress
      );

      const address = addresses[0];

      this.controller.withTransaction((tr) => {
        tr.replaceSelectionWith(
          this.schema.node(
            'block_rdfa',
            {
              property: 'http://lblod.data.gift/vocabularies/editor/isLumpNode',
              resource: address.uri,
            },
            this.schema.node('paragraph', null, [
              this.schema.text(address.fullAddress),
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

    return await this.addressRegister.suggest(term);
  });
}
