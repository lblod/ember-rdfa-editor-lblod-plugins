export interface PreviewableDocument {
  title: string | null;
  content: string | Promise<string | null> | null;
}
