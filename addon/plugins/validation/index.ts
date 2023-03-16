import {
  EditorState,
  NodeType,
  PluginKey,
  PNode,
  ProsePlugin,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import {
  expect,
  Option,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export function validateTransaction(
  state: EditorState,
  tr: Transaction
): ValidationReport {
  const validationState = VALIDATION_KEY.getState(state);
  if (!validationState) {
    return { conforms: true };
  } else {
    if (!tr.docChanged) {
      return validationState.report;
    }
    const newState = state.apply(tr);
    const newValidationState = VALIDATION_KEY.getState(newState);
    if (!newValidationState) {
      return { conforms: true };
    }
    const cachedValidation = tr.getMeta(
      'validated'
    ) as Option<ValidationReport>;
    if (cachedValidation) {
      return cachedValidation;
    }
    tr.setMeta('validated', newValidationState);
    tr.setMeta('firstPass', true);

    return newValidationState.report;
  }
}

export const VALIDATION_KEY: PluginKey<ValidationState> =
  new PluginKey<ValidationState>('validation');

export interface ValidationSpec {
  [key: string]: ValidationShape[];
}

export type ValidationState = {
  report: ValidationReport;
  spec: ValidationSpec;
};

export type PropertyPath = string[];

export type Severity = 'info' | 'warning' | 'violation';

export interface ValidationReport {
  conforms: boolean;
  results?: ValidationResult[];
}

export type ValidationPlugin = ProsePlugin<ValidationState>;

export interface MinCountConstraint {
  kind: 'minCount';
  value: number;
}

export interface MaxCountConstraint {
  kind: 'maxCount';
  value: number;
}

export type ValidationConstraint = MinCountConstraint | MaxCountConstraint;

export type ConstraintMap = {
  [C in ValidationConstraint as C['kind']]?: C['value'];
};

export type ConstraintValidator = (
  constraint: ValidationConstraint,
  shapeContext: ShapeContext
) => Option<ValidationResult>;
export type ConstraintValidatorMap = {
  [C in ValidationConstraint as C['kind']]: ConstraintValidator;
};

export interface ValidationShape {
  focusNodeType: NodeType;
  path: string[] | number[];

  constraints?: ConstraintMap;

  severity?: Severity;
}

export interface ValidationResult {
  focusNode: PNode;

  resultPath: PNode[];

  value?: unknown;

  sourceShape: ValidationShape;

  sourceConstraint: ValidationConstraint;

  message: string;
  severity: Severity;
}

export interface ValidationPluginConfig {
  shapes: ValidationShape[];
}

const CONSTRAINT_VALIDATOR_MAP: ConstraintValidatorMap = {
  maxCount: validateMaxCount,
  minCount: validateMinCount,
};

export function validation(
  configurator: (schema: Schema) => ValidationPluginConfig
): ValidationPlugin {
  const validation = new ProsePlugin<ValidationState>({
    state: {
      init(_stateConfig, state) {
        const spec = compileSpec(configurator, state.schema);
        return {
          spec,
          report: { conforms: true },
        };
      },
      apply(tr, oldPluginState, oldState, newState): ValidationState {
        const schemaChanged = oldState.schema !== newState.schema;
        if (schemaChanged) {
          const spec = compileSpec(configurator, newState.schema);
          const newValidation = doValidation(
            tr,
            oldPluginState,
            oldState,
            newState,
            spec
          );
          tr.setMeta('validated', newValidation);
          tr.setMeta('firstPass', false);
          return { spec, report: newValidation };
        } else {
          const spec = oldPluginState.spec;

          if (!tr.docChanged) {
            return oldPluginState;
          }
          const cachedValidation = tr.getMeta(
            'validated'
          ) as Option<ValidationState>;
          const firstPass = tr.getMeta('firstPass') as Option<boolean>;

          if (firstPass && cachedValidation) {
            tr.setMeta('firstPass', false);
            return cachedValidation;
          }
          const newValidation = doValidation(
            tr,
            oldPluginState,
            oldState,
            newState,
            spec
          );
          tr.setMeta('validated', newValidation);
          tr.setMeta('firstPass', false);
          return { spec, report: newValidation };
        }
      },
    },
  });
  return validation;
}

function compileSpec(
  configurator: (schema: Schema) => ValidationPluginConfig,
  schema: Schema
): ValidationSpec {
  const spec: ValidationSpec = {};
  const shapes = configurator(schema).shapes;
  for (const shape of shapes) {
    const typeName = shape.focusNodeType.name;
    if (spec[typeName]) {
      spec[typeName].push(shape);
    } else {
      spec[typeName] = [shape];
    }
  }
  return spec;
}

interface ShapeContext {
  shape: ValidationShape;
  focusNode: PNode;
  count: number;

  path: PNode[];
}

interface ValidationContext {
  activeShapes: { depth: number; shape: ValidationShape }[][];
  path: PNode[];
  spec: ValidationSpec;
  shapeContext: Map<ValidationShape, ShapeContext>;
}

function doValidation(
  tr: Transaction,
  oldPluginState: ValidationState,
  oldState: EditorState,
  newState: EditorState,
  spec: ValidationSpec
): ValidationReport {
  const results: ValidationResult[] = [];
  const context: ValidationContext = {
    activeShapes: [],
    path: [],
    spec,
    shapeContext: new Map(),
  };
  recValidate(context, results, newState.doc, 0);
  let conforms = true;
  for (const result of results) {
    if (result.severity === 'violation') {
      conforms = false;
      break;
    }
  }
  console.log('results', results);
  return { conforms, results };
}

function recValidate(
  context: ValidationContext,
  results: ValidationResult[],
  node: PNode,
  currentDepth: number
) {
  context.path.push(node);
  const nodeShapes =
    context.spec[node.type.name]?.map((shape) => ({
      depth: currentDepth,
      shape,
    })) ?? [];
  for (const { shape } of nodeShapes) {
    context.shapeContext.set(shape, {
      path: context.path,
      focusNode: node,
      shape,
      count: 0,
    });
  }
  const activeShapes = context.activeShapes.length
    ? context.activeShapes[context.activeShapes.length - 1]
    : [];
  const shapesToCheck = [...activeShapes, ...nodeShapes];
  const nodeIsTargetOfShapes = [];
  const pathIsValidForShapes = [];

  for (const depthShape of shapesToCheck) {
    const {
      depth,
      shape: { path },
    } = depthShape;
    if (path.length + depth === currentDepth) {
      if (path.length === 0 || path[path.length - 1] === node.type.name) {
        nodeIsTargetOfShapes.push(depthShape);
      }
    } else if (path.length + depth > currentDepth) {
      if (currentDepth - depth - 1 > 0) {
        if (path[currentDepth - 1 - depth] === node.type.name) {
          pathIsValidForShapes.push(depthShape);
        }
      } else {
        pathIsValidForShapes.push(depthShape);
      }
    }
  }
  for (const { shape } of nodeIsTargetOfShapes) {
    const shapeContext = unwrap(context.shapeContext.get(shape));
    context.shapeContext.set(shape, {
      ...shapeContext,
      count: shapeContext.count + 1,
    });
  }

  context.activeShapes.push(pathIsValidForShapes);

  for (let i = 0; i < node.content.childCount; i++) {
    const child = node.content.child(i);
    recValidate(context, results, child, currentDepth + 1);
  }

  for (const { shape } of nodeShapes) {
    const shapeContext = expect(
      'Shapecontext not initialized',
      context.shapeContext.get(shape)
    );
    if (shape.constraints) {
      for (const constraint of Object.entries(shape.constraints).map(
        ([kind, value]) => ({ kind, value } as ValidationConstraint)
      )) {
        const result = validateConstraint(constraint, shapeContext);
        if (result) {
          results.push(result);
        }
      }
    }
  }
  context.path.pop();
  context.activeShapes.pop();
  for (const depthShape of nodeShapes) {
    context.shapeContext.delete(depthShape.shape);
  }
}

function validateConstraint(
  constraint: ValidationConstraint,
  shapeContext: ShapeContext
): Option<ValidationResult> {
  return CONSTRAINT_VALIDATOR_MAP[constraint.kind](constraint, shapeContext);
}

function validateMinCount(
  constraint: MinCountConstraint,
  shapeContext: ShapeContext
): Option<ValidationResult> {
  const { shape, focusNode, count, path } = shapeContext;
  if (count < constraint.value) {
    return {
      focusNode,
      sourceConstraint: constraint,
      sourceShape: shape,
      message: 'not enough slices',
      resultPath: path,
      severity: shape.severity ?? 'violation',
    };
  }

  return null;
}

function validateMaxCount(
  constraint: MaxCountConstraint,
  shapeContext: ShapeContext
): Option<ValidationResult> {
  const { shape, focusNode, count, path } = shapeContext;
  if (count > constraint.value) {
    return {
      focusNode,
      sourceConstraint: constraint,
      sourceShape: shape,
      message: 'too many slices',
      resultPath: path,
      severity: shape.severity ?? 'violation',
    };
  }

  return null;
}
