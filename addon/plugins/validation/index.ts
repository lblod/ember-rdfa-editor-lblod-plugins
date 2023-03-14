import { Command, PNode, ProsePlugin } from '@lblod/ember-rdfa-editor';

export interface ValidationState {
  reports: ValidationReport[];
}

export interface ValidationResult {
  reports?: ValidationReport[];
  stopDescending?: boolean;
}

export type ValidationFunc = (
  node: PNode,
  pos: number,
  parent: PNode | null,
  index: number
) => ValidationResult | null | undefined;
export type ValidationConfig = Record<string, ValidationFunc>;

export type ValidationPlugin = ProsePlugin<ValidationState>;

export interface ValidationReport {
  type: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  fixCommand?: Command;
  fixMessage?: string;

  [key: string]: unknown;
}

export function validation(config: ValidationConfig = {}): ValidationPlugin {
  const validation = new ProsePlugin<ValidationState>({
    state: {
      init() {
        return { reports: [] };
      },
      apply(tr, oldPluginState, oldState, newState): ValidationState {
        const reports: ValidationReport[] = [];
        newState.doc.descendants((node, pos, parent, index) => {
          const nodeValidation = config[node.type.name];
          if (nodeValidation) {
            const result = nodeValidation(node, pos, parent, index);
            if (result) {
              if (result.reports) {
                reports.push(...result.reports);
              }
              if (result.stopDescending) {
                return false;
              }
            }
          }
          return true;
        });
        return { reports };
      },
    },
  });
  return validation;
}
