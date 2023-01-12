import { WidgetSpec } from '@lblod/ember-rdfa-editor';

export const defaultDateFormats: DateFormat[] = [
  {
    label: 'Short small Date',
    key: 'short',
    dateFormat: 'dd/MM/yy',
    dateTimeFormat: 'dd/MM/yy HH:mm',
  },
  {
    label: 'Long Date',
    key: 'long',
    dateFormat: 'EEEE dd MMMM yyyy',
    dateTimeFormat: 'EEEE dd MMMM yyyy at HH:mm',
  },
];

const defaultOptions = {
  formats: defaultDateFormats,
  allowCustomFormat: true,
};

export const rdfaDateCardWidget: (options?: DatePluginOptions) => WidgetSpec = (
  options
) => {
  return {
    componentName: 'rdfa-date-plugin/card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      options: options ? options : defaultOptions,
    },
  };
};

export const rdfaDateInsertWidget: WidgetSpec = {
  componentName: 'rdfa-date-plugin/insert',
  desiredLocation: 'insertSidebar',
};

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
