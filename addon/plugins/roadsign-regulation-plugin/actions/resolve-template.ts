import { queryMobilityTemplates } from '../queries/mobility-template';
import { queryVariables } from '../queries/variable';
import { Variable } from '../schemas/variable';
import { MobilityTemplate } from '../schemas/mobility-template';

type ResolvedTemplate = {
  templateString: string;
  variables: Record<string, Exclude<Variable, { type: 'instruction' }>>;
};

export async function resolveTemplate(
  endpoint: string,
  template: MobilityTemplate,
  options: {
    abortSignal?: AbortSignal;
  } = {},
): Promise<ResolvedTemplate> {
  const { abortSignal } = options;
  const variablesArray = await queryVariables(endpoint, {
    templateUri: template.uri,
  });
  const variablesObject = variablesArray.reduce<
    Record<string, Exclude<Variable, { type: 'instruction' }>>
  >((result, item) => {
    if (item.type !== 'instruction') {
      return {
        ...result,
        [item.label]: item,
      };
    } else {
      return result;
    }
  }, {});
  if (!variablesArray.some((variable) => variable.type === 'instruction')) {
    return {
      templateString: template.value,
      variables: variablesObject,
    };
  } else {
    let templateString = template.value;
    for (const variable of variablesArray) {
      if (variable.type !== 'instruction') {
        continue;
      }
      const template = (
        await queryMobilityTemplates(endpoint, {
          instructionVariableUri: variable.uri,
          abortSignal,
        })
      )[0];
      const {
        templateString: instructionTemplateString,
        variables: instructionTemplateVariables,
      } = await resolveTemplate(endpoint, template, options);
      Object.assign(variablesObject, instructionTemplateVariables);
      templateString = templateString.replaceAll(
        `\${${variable.label}}`,
        instructionTemplateString,
      );
    }
    return {
      templateString,
      variables: variablesObject,
    };
  }
}
