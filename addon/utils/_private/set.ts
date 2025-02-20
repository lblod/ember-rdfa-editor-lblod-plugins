export function addAll<T>(set: Set<T>, ...items: T[]) {
  items.forEach((item) => {
    set.add(item);
  });
}
