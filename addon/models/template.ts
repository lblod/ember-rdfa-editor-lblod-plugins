export default interface StandardTemplate {
  title: string;
  matches: string[];
  body: string;
  contexts: string[];
  disabledInContexts: string[];
}
