import { htmlSafe } from '@ember/template';

export type SafeString = ReturnType<typeof htmlSafe>;

export type AllOrNone<T> = T | { [K in keyof T]?: never };
