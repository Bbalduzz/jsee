export class JSONRepairError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JSONRepairError';
  }
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function tryParseNumber(str: string): number | null {
  const num = Number(str);
  return !isNaN(num) ? num : null;
}

export function repairJSON(input: string): string {
  if (!input.trim()) {
    throw new JSONRepairError('Empty input');
  }

  // Try parsing as-is first
  if (isValidJSON(input)) {
    return input;
  }

  let text = input
    .replace(/^\uFEFF/, '') // Remove BOM
    .replace(/[\x00-\x1F]+/g, ' ') // Remove control characters
    .trim();

  // Handle common JSON5 features
  text = text
    // Convert single quotes to double quotes
    .replace(/'([^'\\]|\\.)*'/g, (match) => 
      '"' + match.slice(1, -1).replace(/"/g, '\\"') + '"'
    )
    // Fix unquoted property names
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
    // Fix trailing commas
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix missing commas between elements
    .replace(/}\s*{/g, '},{')
    .replace(/]\s*{/g, ',{')
    .replace(/}\s*\[/g, '},[')
    .replace(/]\s*\[/g, '],[')
    // Fix unquoted string values
    .replace(/:(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\s*[{[\-0-9])/g, ':"$2"');

  // Handle special values
  text = text
    .replace(/:(\s*)(undefined|NaN)\b/g, ':null')
    .replace(/:(\s*)Infinity\b/g, (_, space) => ':' + space + '"Infinity"');

  // Fix numeric values
  text = text.replace(/:(\s*)-?\d+\.?\d*(?:e[+-]?\d+)?/gi, (match) => {
    const num = tryParseNumber(match.split(':')[1]);
    return ':' + (num !== null ? num : 'null');
  });

  // Balance brackets and braces
  const stack: string[] = [];
  let balanced = '';
  
  for (const char of text) {
    if ('{['.includes(char)) {
      stack.push(char === '{' ? '}' : ']');
      balanced += char;
    } else if ('}]'.includes(char)) {
      if (stack.length === 0) continue;
      if (stack[stack.length - 1] === char) {
        stack.pop();
        balanced += char;
      }
    } else {
      balanced += char;
    }
  }

  // Add missing closing brackets/braces
  while (stack.length > 0) {
    balanced += stack.pop();
  }

  // Final validation
  try {
    JSON.parse(balanced);
    return balanced;
  } catch (e) {
    throw new JSONRepairError('Unable to repair JSON: ' + (e as Error).message);
  }
}