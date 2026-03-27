// Locator Extraction and Reliability Scoring

import { estimateClassUniqueness, generateCSSSelector, generateXPath } from './locator-strategies';

export interface Locator {
  strategy: LocatorStrategy;
  value: string;
  reliability: number;
}

export type LocatorStrategy = 'data-testid' | 'aria' | 'id' | 'class' | 'css' | 'xpath';

export interface ElementLocatorResult {
  locators: Locator[];
  primary: Locator;
  fallbacks: Locator[];
}

/**
 * Extract all possible locators from an element
 * and score them by reliability (0-1)
 */
export function extractLocators(element: HTMLElement): ElementLocatorResult {
  const locators: Locator[] = [];

  const testId = element.getAttribute('data-testid');
  if (testId) {
    locators.push({
      strategy: 'data-testid',
      value: `[data-testid="${testId}"]`,
      reliability: 1.0,
    });
  }

  const ariaLabel = element.getAttribute('aria-label');
  const role = element.getAttribute('role');
  if (ariaLabel && role) {
    locators.push({
      strategy: 'aria',
      value: `${role}[aria-label="${ariaLabel}"]`,
      reliability: 0.9,
    });
  } else if (ariaLabel) {
    locators.push({ strategy: 'aria', value: `[aria-label="${ariaLabel}"]`, reliability: 0.85 });
  }

  const id = element.id;
  if (id) {
    locators.push({ strategy: 'id', value: `#${id}`, reliability: 0.8 });
  }

  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter((c) => c.trim());
    if (classes.length > 0 && classes.length < 5) {
      const uniqueness = estimateClassUniqueness(element, classes);
      locators.push({
        strategy: 'class',
        value: `.${classes.join('.')}`,
        reliability: 0.6 * uniqueness,
      });
    }
  }

  const cssSelector = generateCSSSelector(element);
  if (cssSelector) {
    locators.push({ strategy: 'css', value: cssSelector, reliability: 0.4 });
  }

  const xpath = generateXPath(element);
  if (xpath) {
    locators.push({ strategy: 'xpath', value: xpath, reliability: 0.2 });
  }

  locators.sort((a, b) => b.reliability - a.reliability);
  const primary = locators[0];
  const fallbacks = locators.slice(1);

  return { locators, primary, fallbacks };
}

/** Test if a locator can find an element */
export function testLocator(
  locator: Locator,
  root: Document | HTMLElement = document
): HTMLElement | null {
  try {
    switch (locator.strategy) {
      case 'data-testid':
        return root.querySelector(`[data-testid="${locator.value}"]`);
      case 'id':
      case 'css':
      case 'class':
      case 'aria':
        return root.querySelector(locator.value);
      case 'xpath': {
        const result = document.evaluate(
          locator.value,
          root,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        return result.singleNodeValue as HTMLElement;
      }
      default:
        return null;
    }
  } catch (error) {
    console.error('Locator test failed:', error);
    return null;
  }
}

/** Get element info for display */
export function getElementInfo(element: HTMLElement) {
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || null,
    classes: element.className
      ? typeof element.className === 'string'
        ? element.className.split(' ').filter((c) => c)
        : []
      : [],
    text: element.textContent?.slice(0, 50) || null,
    ariaLabel: element.getAttribute('aria-label') || null,
    role: element.getAttribute('role') || null,
  };
}
