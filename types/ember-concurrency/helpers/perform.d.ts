// Taken from @gavant/glint-template-types
declare module 'ember-concurrency/helpers/perform' {
  import Helper from '@ember/component/helper';

  import { Task } from 'ember-concurrency';

  type PrefixOf<T extends unknown[]> = T extends []
    ? []
    : unknown[] extends T
      ? unknown[]
      : T extends [head: infer Head, ...tail: infer Tail]
        ? [] | [Head, ...PrefixOf<Tail>]
        : T extends [head?: infer Head, ...tail: infer Tail]
          ? [Head?, ...PrefixOf<Tail>]
          : [];

  type TaskArgs<T extends Task<unknown, unknown>> =
    T extends Task<unknown, infer Args> ? Args : never;
  type TaskReturn<T extends Task<unknown, unknown>> =
    T extends Task<infer Return, unknown> ? Return : never;

  type RemovePrefix<
    Prefix extends unknown[],
    Tuple extends unknown[],
  > = [] extends Prefix
    ? Tuple
    : [Prefix, Tuple] extends [
          [unknown?, ...infer PrefixRest],
          [unknown?, ...infer TupleRest],
        ]
      ? RemovePrefix<PrefixRest, TupleRest>
      : [];

  type PerformHelperSignature<
    T extends Task<unknown, unknown>,
    GivenArgs extends PrefixOf<TaskArgs<T>>,
  > = {
    Args: { Positional: [T, ...GivenArgs] };
    Return: (
      ...params: RemovePrefix<GivenArgs, TaskArgs<T>>
    ) => Promise<TaskReturn<T>>;
  };

  export default class PerformHelper<
    T extends Task<unknown, unknown>,
    PassedArgs extends PrefixOf<TaskArgs<T>>,
  > extends Helper<PerformHelperSignature<T, PassedArgs>> {}
}
