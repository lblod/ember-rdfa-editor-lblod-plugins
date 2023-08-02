import { action } from '@ember/object';
import Component from '@glimmer/component';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import {
  fetchAddresses,
  resolveAddress,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/address-helpers';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { localCopy, trackedReset } from 'tracked-toolbox';

type Args = {
  controller: SayController;
};

export default class CodelistEditComponent extends Component<Args> {
  @localCopy('currentAddress')
  selectedAddress?: Address;

  @trackedReset<CodelistEditComponent, boolean>({
    memo: 'currentAddress',
    update(component, _key, last) {
      if (component.currentAddress) {
        return component.currentAddress.hasHouseNumber;
      } else {
        return last;
      }
    },
  })
  includeHouseNumber = true;

  @action
  toggleIncludeHouseNumber() {
    this.includeHouseNumber = !this.includeHouseNumber;
  }

  get currentAddress() {
    return this.selectedAddressVariable?.node.attrs.address as
      | Address
      | undefined
      | null;
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

  get showCard() {
    return !!this.selectedAddressVariable;
  }

  get canUpdate() {
    return (
      !!this.selectedAddress &&
      !this.selectedAddress.sameAs(
        this.selectedAddressVariable?.node.attrs.address as Address | undefined,
      )
    );
  }

  updateAddressVariable = dropTask(async () => {
    if (this.selectedAddressVariable && this.selectedAddress) {
      const { pos } = this.selectedAddressVariable;

      const address = this.includeHouseNumber
        ? await resolveAddress(this.selectedAddress)
        : this.selectedAddress;
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'address', address);
      });
    }
  });

  @action
  selectAddress(address: Address) {
    this.selectedAddress = address;
  }

  get controller() {
    return this.args.controller;
  }

  searchAddress = restartableTask(async (term: string) => {
    await timeout(400);
    return fetchAddresses(term, this.includeHouseNumber);
  });
}
