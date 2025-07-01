export default function removeQuotes(string: string) {
  let finalString = string;
  if (string.charAt(0) === '"' && string.charAt(string.length - 1) === '"') {
    finalString = string.substring(1, string.length - 1);
  }
  return finalString;
}
