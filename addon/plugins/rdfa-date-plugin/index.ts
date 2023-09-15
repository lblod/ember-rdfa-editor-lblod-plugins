export const defaultDateFormats: DateFormat[] = [
  {
    key: 'short',
    dateFormat: 'dd/MM/yy',
    dateTimeFormat: 'dd/MM/yy HH:mm',
  },
  {
    key: 'long',
    dateFormat: 'EEEE dd MMMM yyyy',
    dateTimeFormat: 'PPPPp',
  },
];

export type DateFormat = {
  label?: string;
  key: string;
  dateFormat: string;
  dateTimeFormat: string;
};

export type DateOptions = {
  formats: DateFormat[];
  allowCustomFormat: boolean;
};
