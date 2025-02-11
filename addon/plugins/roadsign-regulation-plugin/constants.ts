import { MOBILITEIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export const ZONALITY_OPTIONS = {
  POTENTIALLY_ZONAL:
    'http://lblod.data.gift/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f',
  ZONAL: 'http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d',
  NON_ZONAL:
    'http://lblod.data.gift/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc',
} as const;

export const SIGN_CONCEPT_TYPES = {
  TRAFFIC_SIGN: MOBILITEIT('Verkeerstekenconcept').full,
  ROAD_SIGN: MOBILITEIT('Verkeersbordconcept').full,
  TRAFFIC_LIGHT: MOBILITEIT('Verkeerslichtconcept').full,
  ROAD_MARKING: MOBILITEIT('Wegmarkeringconcept').full,
} as const;

export const SIGN_TYPES = {
  TRAFFIC_SIGN: MOBILITEIT('Verkeersteken').full,
  ROAD_SIGN: MOBILITEIT('Verkeersbord').full,
  TRAFFIC_LIGHT: MOBILITEIT('Verkeerslicht').full,
  ROAD_MARKING: MOBILITEIT('Wegmarkering').full,
} as const;

export const SIGN_TYPE_MAPPING = {
  [SIGN_CONCEPT_TYPES.TRAFFIC_SIGN]: SIGN_TYPES.TRAFFIC_SIGN,
  [SIGN_CONCEPT_TYPES.ROAD_SIGN]: SIGN_TYPES.ROAD_SIGN,
  [SIGN_CONCEPT_TYPES.TRAFFIC_LIGHT]: SIGN_TYPES.TRAFFIC_LIGHT,
  [SIGN_CONCEPT_TYPES.ROAD_MARKING]: SIGN_TYPES.ROAD_MARKING,
} as const;

export const SIGN_CONCEPT_TYPE_LABELS = {
  [SIGN_CONCEPT_TYPES.TRAFFIC_SIGN]: 'Verkeersteken',
  [SIGN_CONCEPT_TYPES.ROAD_SIGN]: 'Verkeersbord',
  [SIGN_CONCEPT_TYPES.TRAFFIC_LIGHT]: 'Verkeerslicht',
  [SIGN_CONCEPT_TYPES.ROAD_MARKING]: 'Wegmarkering',
} as const;
