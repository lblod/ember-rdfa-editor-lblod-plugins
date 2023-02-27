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

export type DateFormat = {
  label: string;
  key: string;
  dateFormat: string;
  dateTimeFormat: string;
};

export type DateOptions = {
  placeholder: {
    insertDate: string;
    insertDateTime: string;
  };
  formats: DateFormat[];
  allowCustomFormat: boolean;
};
