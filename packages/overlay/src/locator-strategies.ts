// CSS selector and XPath generation strategies

/** Estimate how unique a class combination is (0-1) */
export function estimateClassUniqueness(element: HTMLElement, classes: string[]): number {
  if (classes.length >= 3) return 0.9;
  if (classes.length >= 2) return 0.7;
  if (classes.length === 1) return 0.5;
  return 0.3;
}

/** Generate CSS selector by walking up the DOM tree */
export function generateCSSSelector(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName !== 'BODY') {
    let part = current.tagName.toLowerCase();

    if (current.id) {
      part += `#${current.id}`;
      parts.unshift(part);
      break;
    }

    if (current.className && typeof current.className === 'string') {
      const classes = current.className
        .split(' ')
        .filter((c) => c.trim())
        .slice(0, 2);
      if (classes.length > 0) {
        part += `.${classes.join('.')}`;
      }
    }

    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children).filter(
        (child) => child.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        part += `:nth-child(${index})`;
      }
    }

    parts.unshift(part);
    current = current.parentElement;
    if (parts.length >= 5) break;
  }

  return parts.join(' > ');
}

/** Generate XPath by walking up the DOM tree */
export function generateXPath(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName !== 'BODY') {
    let part = current.tagName.toLowerCase();

    if (current.id) {
      parts.unshift(`//*[@id="${current.id}"]`);
      break;
    }

    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children);
      const tagSiblings = siblings.filter((child) => child.tagName === current!.tagName);
      if (tagSiblings.length > 1) {
        const index = tagSiblings.indexOf(current) + 1;
        part += `[${index}]`;
      }
    }

    parts.unshift(part);
    current = current.parentElement;
    if (parts.length >= 5) break;
  }

  return '/' + parts.join('/');
}
