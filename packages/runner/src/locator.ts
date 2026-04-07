/**
 * Locator Resolution Engine
 *
 * Converts element locators from the database into Puppeteer selectors.
 * Implements fallback chain for reliability.
 */

export interface LocatorPrimary {
  type: 'testid' | 'role' | 'css' | 'xpath' | 'text';
  value: string;
  meta?: Record<string, any>;
}

export interface ElementData {
  id: string;
  name: string;
  locator_primary: string; // JSON string
  locator_fallbacks: string; // JSON array
  reliability_score: number;
}

/**
 * Convert a locator from DB format to Puppeteer selector
 */
export function locatorToPuppeteerSelector(locator: LocatorPrimary): string {
  switch (locator.type) {
    case 'testid':
      return `[data-testid="${locator.value}"]`;

    case 'role':
      // For role-based locators, we'll use CSS selectors with aria roles
      if (locator.meta?.name) {
        return `[role="${locator.value}"][aria-label*="${locator.meta.name}"]`;
      }
      return `[role="${locator.value}"]`;

    case 'css':
      return locator.value;

    case 'xpath':
      // Puppeteer uses xpath: prefix
      return `xpath/${locator.value}`;

    case 'text':
      // Text-based selector using XPath
      return `xpath///*[contains(text(), "${locator.value}")]`;

    default:
      throw new Error(`Unsupported locator type: ${(locator as any).type}`);
  }
}

/**
 * Resolve element from database with fallback chain
 */
export async function resolveElement(
  page: any, // Puppeteer Page
  elementData: ElementData,
  params: Record<string, any> = {}
): Promise<any> {
  // Parse primary locator
  let primary: LocatorPrimary;
  try {
    primary = JSON.parse(elementData.locator_primary);
  } catch (err) {
    throw new Error(`Invalid locator_primary JSON for element ${elementData.id}: ${err}`, {
      cause: err,
    });
  }

  // Replace template variables (e.g., {{cardId}})
  const resolvedPrimary = replaceParams(primary, params);
  const primarySelector = locatorToPuppeteerSelector(resolvedPrimary);

  // Try primary locator
  try {
    const element = await page.$(primarySelector);
    if (element) {
      return { element, selector: primarySelector, locator: resolvedPrimary };
    }
  } catch (err) {
    console.warn(`Primary locator failed for ${elementData.name}: ${err}`);
  }

  // Try fallbacks
  let fallbacks: LocatorPrimary[] = [];
  try {
    fallbacks = JSON.parse(elementData.locator_fallbacks);
  } catch {
    console.warn(`Invalid locator_fallbacks JSON for element ${elementData.id}`);
  }

  for (const fallback of fallbacks) {
    const resolvedFallback = replaceParams(fallback, params);
    const fallbackSelector = locatorToPuppeteerSelector(resolvedFallback);

    try {
      const element = await page.$(fallbackSelector);
      if (element) {
        console.info(`Used fallback locator for ${elementData.name}: ${fallback.type}`);
        return { element, selector: fallbackSelector, locator: resolvedFallback };
      }
    } catch (err) {
      console.warn(`Fallback ${fallback.type} failed for ${elementData.name}: ${err}`);
    }
  }

  throw new Error(
    `Element not found: ${elementData.name} (${elementData.id}). Primary: ${primarySelector}, Fallbacks: ${fallbacks.length}`
  );
}

/**
 * Replace template variables in locator values (e.g., {{cardId}})
 */
function replaceParams(locator: LocatorPrimary, params: Record<string, any>): LocatorPrimary {
  const replacedValue = locator.value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in params) {
      return String(params[key]);
    }
    console.warn(`Template variable ${key} not found in params`);
    return match;
  });

  return {
    ...locator,
    value: replacedValue,
  };
}

/**
 * Get element's bounding box for overlays
 */
export async function getElementBounds(
  element: any
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  try {
    const box = await element.boundingBox();
    return box;
  } catch (err) {
    console.warn(`Failed to get element bounds: ${err}`);
    return null;
  }
}
