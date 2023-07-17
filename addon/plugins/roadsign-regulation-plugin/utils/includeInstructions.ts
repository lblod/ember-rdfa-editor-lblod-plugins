import Instruction from '@lblod/ember-rdfa-editor-lblod-plugins/models/instruction';

export default function includeInstructions(
  html: string,
  instructions: Instruction[],
  annotated: boolean,
) {
  let finalHtml = html;
  for (const instruction of instructions) {
    finalHtml = finalHtml.replaceAll(
      `\${${instruction.name ?? ''}}`,
      annotated ? instruction.annotatedTemplate : instruction.template,
    );
  }
  return finalHtml;
}
