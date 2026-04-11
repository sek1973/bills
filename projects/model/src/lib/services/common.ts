
export const IMPORT_LINE_SEPARATOR = '\n';
export const IMPORT_COLUMN_SEPARATOR = '\t';

export interface ImportReport {
  id?: number;
  error?: string;
  warning?: string;
  row?: number;
  label?: string;
}
