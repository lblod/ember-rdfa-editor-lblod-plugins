export default function memoize(func: (...a: unknown[]) => unknown) {
  const cache: Record<string, unknown> = {};
  return (...args: unknown[]) => {
    const serializedArgs = JSON.stringify(args);
    cache[serializedArgs] = cache[serializedArgs] || func(args);
    return cache[serializedArgs];
  };
}
