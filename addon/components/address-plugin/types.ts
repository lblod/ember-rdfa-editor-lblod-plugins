export type AddressSuggestion = {
  ID: number;
  FormattedAddress: string;
  Municipality: string;
  Thoroughfarename: string; // street
  Housenumber: string;
  Zipcode: string;
};

export type Address = {
  identificator: {
    id: string;
    naamruimte: string;
    objectId: string;
    versieId: string;
  };
  detail: string;
  huisnummer: string;
  volledigAdres: {
    geografischeNaam: {
      spelling: string;
      taal: string;
    };
  };
  adresStatus: string;
};
