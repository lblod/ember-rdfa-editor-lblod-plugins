import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  SayController,
  Selection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { NodeSelection, PNode } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import {
  isNone,
  isSome,
  Option,
  optionMap,
  optionMapOr,
  unwrapOr,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import {
  DateFormat,
  DateOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/date';
import {
  ValidationError,
  formatContainsTime,
  validateDateFormat,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/date-helpers';
import { Velcro } from 'ember-velcro';

import { InfoCircleIcon } from '@appuniversum/ember-appuniversum/components/icons/info-circle';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';
import { XSD } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import AuCard from '../../_private/appuniversum-overrides/au-card';

type Args = {
  controller: SayController;
  options: DateOptions;
};
const SECONDS_REGEX = new RegExp('[sStT]|p{2,}');
export default class DateEditComponent extends Component<Args> {
  CrossIcon = CrossIcon;
  InfoCircleIcon = InfoCircleIcon;
  Velcro = Velcro;
  AuCard = AuCard;

  @service
  declare intl: IntlService;

  @tracked helpModalOpen = false;
  @tracked
  tooltipOpen = false;

  get formats(): DateFormat[] {
    return this.args.options.formats;
  }

  get controller() {
    return this.args.controller;
  }

  get selection(): Selection {
    return this.controller.activeEditorState.selection;
  }

  get selectedDateNode(): Option<PNode> {
    if (
      this.selection instanceof NodeSelection &&
      this.selection.node.type === this.controller.schema.nodes['date']
    ) {
      return this.selection.node;
    } else {
      return null;
    }
  }

  get documentDate(): Option<Date> {
    if (this.selectedDateNode) {
      const dateVal = this.selectedDateNode.attrs['content'] as Option<string>;
      if (dateVal) {
        return new Date(dateVal);
      }
    }
    return;
  }

  get documentDatePos(): Option<number> {
    if (this.selectedDateNode) {
      return this.selection.from;
    }
    return null;
  }

  get showCard() {
    return isSome(this.documentDatePos);
  }

  get onlyDate(): boolean {
    return optionMapOr(
      false,
      (node) => {
        return !formatContainsTime(node.attrs.format);
      },
      this.selectedDateNode,
    );
  }

  get showSeconds(): boolean {
    return optionMapOr(
      false,
      (node) => {
        const format = node.attrs.format as string;
        return SECONDS_REGEX.test(format.replace(/'[^']*'|"[^"]*"/g, ''));
      },
      this.selectedDateNode,
    );
  }

  get documentDateFormat(): Option<string> {
    return optionMap(
      (node) => node.attrs.format as string,
      this.selectedDateNode,
    );
  }

  get documentDateFormatType(): Option<DateFormat> {
    if (this.documentDateFormat) {
      if (this.onlyDate) {
        return this.formats.find(
          (format) => format.dateFormat === this.documentDateFormat,
        );
      } else {
        return this.formats.find(
          (format) => format.dateTimeFormat === this.documentDateFormat,
        );
      }
    }
    return null;
  }

  get isCustom(): boolean {
    return unwrapOr(false, this.selectedDateNode?.attrs.custom as boolean);
  }

  get isCustomAllowed(): boolean {
    return unwrapOr(
      true,
      this.selectedDateNode?.attrs.customAllowed as boolean,
    );
  }

  get dateFormatType(): string {
    if (this.isCustom) {
      return 'custom';
    }
    return this.documentDateFormatType?.key || 'custom';
  }

  get customDateFormatError(): ValidationError | null {
    const format = this.documentDateFormat ?? '';
    const validation = validateDateFormat(format);
    if (validation.type === 'ok') {
      return null;
    } else {
      return validation;
    }
  }

  get humanError(): string | null {
    if (this.customDateFormatError) {
      const { error, payload } = this.customDateFormatError;
      const locale = this.intl.primaryLocale ?? this.intl.locales[0];
      if (error === 'character') {
        const msg =
          this.intl.getTranslation(`date-plugin.validation.${error}`, locale) ??
          '';
        const suggestion =
          this.intl.getTranslation(
            'date-plugin.validation.character-suggestion',
            locale,
          ) ?? '';
        const chars = payload?.invalidCharacters ?? '';
        return `${msg}: ${chars}. ${suggestion}: '${chars}'`;
      }
      return (
        this.intl.getTranslation(`date-plugin.validation.${error}`, locale) ??
        null
      );
    }
    return null;
  }

  get pickerDate(): Option<Date> {
    return this.documentDate;
  }

  @action
  showTooltip() {
    this.tooltipOpen = true;
  }

  @action hideTooltip() {
    this.tooltipOpen = false;
  }

  @action
  changeDate(date: Date) {
    const pos = this.documentDatePos;
    if (pos) {
      this.controller.withTransaction((tr: Transaction) => {
        return tr.setNodeAttribute(pos, 'content', date.toISOString());
      });
    }
  }

  @action
  changeIncludeTime(includeTime: boolean) {
    if (this.isCustom) {
      return;
    }
    const dateFormatType = this.documentDateFormatType;
    if (dateFormatType) {
      if (includeTime) {
        this.setDateFormat(dateFormatType.dateTimeFormat, false);
      } else {
        this.setDateFormat(dateFormatType.dateFormat, false);
      }
    }
  }

  setDateFormat(dateFormat: string, custom = false) {
    const pos = this.documentDatePos;
    if (isNone(pos)) {
      return;
    }
    const datatype = !formatContainsTime(dateFormat)
      ? XSD('date').namedNode
      : XSD('dateTime').namedNode;
    this.controller.withTransaction((tr) => {
      return tr
        .setNodeAttribute(pos, 'format', dateFormat)
        .setNodeAttribute(pos, 'custom', custom)
        .setNodeAttribute(pos, 'datatype', datatype);
    });
  }

  @action
  setDateFormatFromKey(formatKey: string) {
    const pos = this.documentDatePos;
    if (isNone(pos)) {
      return;
    }
    if (formatKey === 'custom') {
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'custom', true);
      });
    } else {
      const format = this.formats.find((frmt) => frmt.key === formatKey);
      if (format) {
        this.setDateFormat(
          this.onlyDate ? format.dateFormat : format.dateTimeFormat,
          false,
        );
      }
    }
  }

  @action
  setCustomDateFormat(event: InputEvent) {
    const format = (event.target as HTMLInputElement).value;

    const pos = this.documentDatePos;
    if (isSome(pos) && isSome(format)) {
      const datatype = !formatContainsTime(format)
        ? XSD('date').namedNode
        : XSD('dateTime').namedNode;
      this.controller.withTransaction((tr) => {
        return tr
          .setNodeAttribute(pos, 'format', format)
          .setNodeAttribute(pos, 'datatype', datatype);
      });
    }
  }

  @action
  toggleHelpModal() {
    this.helpModalOpen = !this.helpModalOpen;
  }
}
