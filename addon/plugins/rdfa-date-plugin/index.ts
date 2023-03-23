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
