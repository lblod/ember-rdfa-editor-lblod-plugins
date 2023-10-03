/**
 * Return memoized version of the passed function.
 * Memoization is done on the JSON stringified arguments, passing no args, undefined, or any number
 * of only undefined arguments does not do any caching.
 */
export default function memoize<T>(func: (...a: unknown[]) => T) {
  const cache: Record<string, T> = {};
  return (...args: unknown[]) => {
    if (args.length === 0 || args.every((arg) => arg === undefined)) {
      return func(...args);
    }
    const serializedArgs = JSON.stringify(args);
    cache[serializedArgs] = cache[serializedArgs] || func(...args);
    return cache[serializedArgs];
  };
}
