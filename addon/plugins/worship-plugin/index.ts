export type AdministrativeUnit = {
  uri: string;
  label: string;
};

export type WorshipPluginConfig = {
  endpoint: string;
  defaultAdministrativeUnit?: AdministrativeUnit;
};
