export default function inArray(arr: unknown[], needle: unknown) {
  if (!Array.isArray(arr)) {
    return false;
  }

  return arr.includes(needle);
}
