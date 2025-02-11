export function omit<O extends object, K extends keyof O>(
  obj: O,
  ...keys: K[]
): Omit<O, K> {
  const objCopy = { ...obj };
  keys.forEach((key) => delete objCopy[key]);
  return objCopy;
}
