export interface LocatorStrategy {
  type: 'testid' | 'role' | 'label' | 'css' | 'xpath';
  value: string;
  meta?: any;
  reliability: number;
}

const reliabilityByType: Record<LocatorStrategy['type'], number> = {
  testid: 0.98,
  role: 0.9,
  label: 0.82,
  css: 0.68,
  xpath: 0.45,
};

function withReliability(strategy: Omit<LocatorStrategy, 'reliability'>): LocatorStrategy {
  let score = reliabilityByType[strategy.type];
  if (strategy.type === 'css' && strategy.value.startsWith('#')) {
    score = Math.max(score, 0.86);
  }
  if (strategy.type === 'css' && strategy.value.includes('.')) {
    score = Math.min(score, 0.7);
  }
  return { ...strategy, reliability: score };
}

export function getXPath(element: HTMLElement): string {
  if (element.id) return `//*[@id="${element.id}"]`;

  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = current.previousSibling;

    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }

    const tagName = current.nodeName.toLowerCase();
    const pathIndex = index > 0 ? `[${index + 1}]` : '';
    parts.unshift(`${tagName}${pathIndex}`);
    current = current.parentElement;
  }

  return '/' + parts.join('/');
}

export function generateLocators(element: HTMLElement): LocatorStrategy[] {
  const strategies: LocatorStrategy[] = [];

  // 1. data-testid (highest priority)
  const testId = element.getAttribute('data-testid');
  if (testId) {
    strategies.push(withReliability({ type: 'testid', value: testId }));
  }

  // 2. ARIA role + label
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  if (role) {
    strategies.push(
      withReliability({
        type: 'role',
        value: role,
        meta: ariaLabel ? { name: ariaLabel } : undefined,
      })
    );
  }

  // 3. aria-label alone
  if (ariaLabel && !role) {
    strategies.push(withReliability({ type: 'label', value: ariaLabel }));
  }

  // 4. CSS selector (id, class, tag)
  const id = element.id;
  if (id) {
    strategies.push(withReliability({ type: 'css', value: `#${id}` }));
  } else {
    const classes = Array.from(element.classList).filter(
      (c) => !c.startsWith('hover:') && !c.startsWith('focus:')
    );
    if (classes.length > 0 && classes.length <= 3) {
      strategies.push(withReliability({ type: 'css', value: `.${classes.join('.')}` }));
    }
  }

  // 5. XPath (fallback)
  const xpath = getXPath(element);
  if (xpath) {
    strategies.push(withReliability({ type: 'xpath', value: xpath }));
  }

  return strategies.sort((a, b) => b.reliability - a.reliability);
}

export function findElementByLocator(
  root: HTMLElement | null,
  locator: LocatorStrategy
): HTMLElement | null {
  if (!root) return null;

  switch (locator.type) {
    case 'testid':
      return root.querySelector(`[data-testid="${locator.value}"]`) as HTMLElement | null;
    case 'label':
      return root.querySelector(`[aria-label="${locator.value}"]`) as HTMLElement | null;
    case 'role': {
      const roleMatches = Array.from(
        root.querySelectorAll(`[role="${locator.value}"]`)
      ) as HTMLElement[];
      if (locator.meta?.name) {
        return (
          roleMatches.find((el) =>
            (el.getAttribute('aria-label') || '').includes(locator.meta.name)
          ) || null
        );
      }
      return roleMatches[0] || null;
    }
    case 'css':
      return root.querySelector(locator.value) as HTMLElement | null;
    case 'xpath': {
      const doc = root.ownerDocument;
      const result = doc.evaluate(
        locator.value,
        root,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue as HTMLElement | null;
    }
    default:
      return null;
  }
}
