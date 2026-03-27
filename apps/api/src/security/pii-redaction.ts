type RedactionRule = {
  name: string;
  pattern: RegExp;
  replacement: string;
};

const SENSITIVE_KEY_PATTERN =
  /(token|secret|password|cookie|authorization|api[_-]?key|key_hash|encryption|ssn|social|credit|card|iban|account|routing)/i;

export const DEFAULT_TEXT_RULES: RedactionRule[] = [
  {
    name: 'email',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: '[REDACTED_EMAIL]',
  },
  {
    name: 'phone',
    pattern: /\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)\d{3,4}[\s-]?\d{3,4}\b/g,
    replacement: '[REDACTED_PHONE]',
  },
  {
    name: 'credit_card',
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    replacement: '[REDACTED_CARD]',
  },
  {
    name: 'ssn',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[REDACTED_SSN]',
  },
];

export function redactText(input: string, rules: RedactionRule[] = DEFAULT_TEXT_RULES): string {
  let out = input;
  for (const rule of rules) {
    out = out.replace(rule.pattern, rule.replacement);
  }
  return out;
}

export function redactValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactText(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }

  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = '[REDACTED]';
      continue;
    }
    out[key] = redactValue(entry);
  }
  return out;
}

export type OCRTextBlock = {
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
};

export type RedactionMaskOperation = {
  type: 'blur' | 'mask';
  x: number;
  y: number;
  width: number;
  height: number;
};

export function detectPiiRegions(blocks: OCRTextBlock[]): OCRTextBlock[] {
  return blocks.filter((block) => redactText(block.text) !== block.text);
}

export function buildMaskOperations(
  blocks: OCRTextBlock[],
  mode: 'blur' | 'mask' = 'blur'
): RedactionMaskOperation[] {
  const piiBlocks = detectPiiRegions(blocks);
  return piiBlocks.map((block) => ({
    type: mode,
    x: block.bbox.x,
    y: block.bbox.y,
    width: block.bbox.width,
    height: block.bbox.height,
  }));
}
