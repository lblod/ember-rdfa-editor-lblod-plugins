declare module 'ember-mu-transform-helpers/transforms/string-set' {
  import Transform from '@ember-data/serializer/transform';

  module 'ember-data/types/registries/transform' {
    export default interface TransformRegistry {
      'string-set': StringSetTransform;
    }
  }
  export default class StringSetTransform extends Transform {
    deserialize(serialized: unknown[]): unknown[];

    serialize(deserialized: unknown[]): unknown[];
  }
}
