import { AVAILABLE_VARIABLES } from './constants';

/**
 * Parse a template by replacing variables with provided values
 */
export function parseTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, variableName) => {
    return values[variableName] ?? match;
  });
}

/**
 * Validate a template and return validation result with errors
 */
export function validateTemplate(template: string): {
  isValid: boolean;
  errors: string[];
  availableVariables: string[];
} {
  const errors: string[] = [];
  const availableVariables = AVAILABLE_VARIABLES.map(v => v.variable);
  
  if (!template) {
    return { isValid: true, errors, availableVariables };
  }

  // Simple regex to find properly formed variables
  const validVariables = template.match(/\{[A-Za-z]+\}/g) || [];
  
  // Check for unknown variables
  for (const variable of validVariables) {
    if (!availableVariables.includes(variable)) {
      errors.push(`Unknown variable: ${variable}`);
    }
  }

  // Find malformed variables - text that has { or } but not proper format
  const malformedMatches = template.match(/\{[^}]*$|\}[^{]*|^[^{]*\}/g) || [];
  for (const match of malformedMatches) {
    if (match.includes('{') || match.includes('}')) {
      errors.push(`Malformed variable: ${match.trim()}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    availableVariables
  };
}