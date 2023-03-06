import { PNode, ProsePlugin } from '@lblod/ember-rdfa-editor';

export interface ValidationState {
  errors: ValidationError[];
}

export interface ValidationResult {
  errors?: ValidationError[];
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

export interface ValidationError {
  type: string;
  message: string;

  [key: string]: unknown;
}

export function validation(config: ValidationConfig = {}): ValidationPlugin {
  const validation = new ProsePlugin<ValidationState>({
    state: {
      init() {
        return { errors: [] };
      },
      apply(tr, oldPluginState, oldState, newState): ValidationState {
        const errors: ValidationError[] = [];
        newState.doc.descendants((node, pos, parent, index) => {
          const nodeValidation = config[node.type.name];
          if (nodeValidation) {
            const result = nodeValidation(node, pos, parent, index);
            if (result) {
              if (result.errors) {
                errors.push(...result.errors);
              }
              if (result.stopDescending) {
                return false;
              }
            }
          }
          return true;
        });
        return { errors };
      },
    },
  });
  return validation;
}
