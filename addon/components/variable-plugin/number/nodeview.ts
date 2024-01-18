import Component from '@glimmer/component';
import {
  DecorationSource,
  PNode,
  RdfaAttrs,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import { service } from '@ember/service';
import intlService from 'ember-intl/services/intl';
import { localCopy } from 'tracked-toolbox';
import { isBlank } from '@ember/utils';
import { isNumber } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { numberToWords } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/number-to-words';
import { Velcro } from 'ember-velcro';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { Property } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { getParsedRDFAAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  contentDecorations?: DecorationSource;
};

export default class NumberNodeviewComponent extends Component<Args> {
  Velcro = Velcro;

  @localCopy('number', '') declare inputNumber: string;
  @localCopy('args.node.attrs.writtenNumber', false)
  declare writtenNumber: boolean;
  @service declare intl: intlService;
  cursorPositionKeyDown: number | null = null;

  focus(element: HTMLInputElement) {
    element.focus();
  }

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get translations() {
    return {
      placeholder: this.intl.t('variable.number.placeholder', {
        locale: this.documentLanguage,
      }),
    };
  }

  get node() {
    return this.args.node;
  }

  get number(): number | null | undefined {
    return getParsedRDFAAttribute(this.node.attrs, EXT('content'))?.object;
  }

  get formattedNumber() {
    const value = this.number;
    if (!isNumber(value)) {
      return value;
    }
    if (!this.writtenNumber) {
      return value;
    } else {
      return numberToWords(Number(value), { lang: this.documentLanguage });
    }
  }

  get selected() {
    return this.args.selected;
  }

  get minValue() {
    return this.node.attrs.minimumValue as number;
  }

  get maxValue() {
    return this.node.attrs.maximumValue as number;
  }

  get label() {
    return getParsedRDFAAttribute(
      this.args.node.attrs as RdfaAttrs,
      EXT('label'),
    )?.object;
  }

  @action onInputNumberChange(event: InputEvent) {
    this.inputNumber = (event.target as HTMLInputElement).value;
    this.validateAndSave();
  }

  @action
  changeWrittenNumber() {
    this.args.updateAttribute('writtenNumber', !this.writtenNumber);
  }

  get errorMessage() {
    if (isBlank(this.inputNumber)) {
      return '';
    }
    const number = Number(this.inputNumber);
    if (Number.isNaN(number)) {
      return this.intl.t('variable.number.error-not-number');
    }
    const validMinimum = !this.minValue || number >= this.minValue;
    const validMaximum = !this.maxValue || number <= this.maxValue;

    if (!validMinimum || !validMaximum) {
      if (this.minValue && this.maxValue) {
        return this.intl.t('variable.number.error-number-between', {
          minValue: this.minValue,
          maxValue: this.maxValue,
        });
      } else if (this.minValue) {
        return this.intl.t('variable.number.error-number-above', {
          minValue: this.minValue,
        });
      } else if (this.maxValue) {
        return this.intl.t('variable.number.error-number-below', {
          maxValue: this.maxValue,
        });
      }
    }
    return '';
  }

  @action
  validateAndSave() {
    if (!this.errorMessage) {
      this.args.updateAttribute(
        'properties',
        this.node.attrs.properties.map((prop: Property) => {
          if (
            prop.type === 'attribute' &&
            EXT('content').matches(prop.predicate)
          ) {
            return { ...prop, object: this.inputNumber };
          } else {
            return prop;
          }
        }),
      );
    }
  }
}
