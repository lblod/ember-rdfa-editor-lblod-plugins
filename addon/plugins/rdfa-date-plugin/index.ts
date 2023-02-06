import { WidgetSpec } from '@lblod/ember-rdfa-editor';

export const defaultDateFormats: DateFormat[] = [
  {
    label: 'Short Date',
    key: 'short',
    dateFormat: 'dd/MM/yy',
    dateTimeFormat: 'dd/MM/yy HH:mm',
  },
  {
    label: 'Long Date',
    key: 'long',
    dateFormat: 'EEEE dd MMMM yyyy',
    dateTimeFormat: 'PPPPp',
  },
];

const defaultOptions = {
  formats: defaultDateFormats,
  allowCustomFormat: true,
};

export function rdfaDateCardWidget(options?: DatePluginOptions): WidgetSpec {
  return {
    componentName: 'rdfa-date-plugin/card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      options: options ? options : defaultOptions,
    },
  };
}

export function rdfaDateInsertWidget(options?: DatePluginOptions): WidgetSpec {
  return {
    componentName: 'rdfa-date-plugin/insert',
    desiredLocation: 'insertSidebar',
    widgetArgs: {
      options: options ? options : defaultOptions,
    },
  };
}

export type DateFormat = {
  label: string;
  key: string;
  dateFormat: string;
  dateTimeFormat: string;
};

type DatePluginOptions = {
  formats: DateFormat[];
  allowCustomFormat: boolean;
};
