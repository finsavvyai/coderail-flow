import { type Template } from '@coderail-flow/dsl';

const templatesSeed = [
  {
    id: 'bug-report-generator',
    name: 'Bug Report Generator',
    description: 'Capture a bug reproduction path with screenshots and clear narration.',
    category: 'qa',
    tags: ['qa', 'bug-report', 'debug'],
    flow: {
      params: [
        { name: 'targetUrl', type: 'string', required: true },
        { name: 'summary', type: 'string', required: true },
      ],
      steps: [
        { type: 'goto', url: '{{targetUrl}}', narrate: 'Opening the bug page' },
        { type: 'caption', text: 'Bug Summary: {{summary}}', placement: 'bottom' },
        { type: 'screenshot', label: 'initial-state' },
        { type: 'pause', ms: 1200 },
      ],
    },
  },
  {
    id: 'feature-walkthrough',
    name: 'Feature Walkthrough',
    description: 'Simple guided flow that highlights a page and records the current feature state.',
    category: 'product',
    tags: ['walkthrough', 'demo', 'product'],
    flow: {
      params: [
        { name: 'targetUrl', type: 'string', required: true },
        { name: 'headline', type: 'string', required: true },
      ],
      steps: [
        { type: 'goto', url: '{{targetUrl}}', narrate: 'Navigating to feature page' },
        { type: 'caption', text: '{{headline}}', placement: 'center' },
        { type: 'screenshot', label: 'feature-overview', fullPage: true },
      ],
    },
  },
  {
    id: 'user-onboarding',
    name: 'User Onboarding',
    description: 'Create a reusable onboarding intro with captions and final screenshot.',
    category: 'onboarding',
    tags: ['onboarding', 'tutorial', 'new-users'],
    flow: {
      params: [
        { name: 'startUrl', type: 'string', required: true },
        { name: 'welcomeText', type: 'string', required: true },
      ],
      steps: [
        { type: 'goto', url: '{{startUrl}}', narrate: 'Starting onboarding' },
        { type: 'caption', text: '{{welcomeText}}', placement: 'bottom' },
        { type: 'pause', ms: 800 },
        { type: 'screenshot', label: 'onboarding-intro' },
      ],
    },
  },
  {
    id: 'api-demo',
    name: 'API Documentation Demo',
    description: 'Record an API endpoint workflow with requests, responses, and verification.',
    category: 'development',
    tags: ['api', 'documentation', 'developer-tools'],
    flow: {
      params: [
        { name: 'apiUrl', type: 'string', required: true },
        { name: 'endpoint', type: 'string', required: true },
      ],
      steps: [
        { type: 'goto', url: '{{apiUrl}}', narrate: 'Opening API documentation' },
        { type: 'caption', text: 'Testing {{endpoint}} endpoint', placement: 'top' },
        { type: 'pause', ms: 1000 },
        { type: 'screenshot', label: 'api-docs' },
        { type: 'assertText', text: '200', timeout: 5000 },
      ],
    },
  },
  {
    id: 'ecommerce-checkout',
    name: 'E-commerce Checkout Flow',
    description: 'Test a complete e-commerce checkout from cart to confirmation.',
    category: 'testing',
    tags: ['ecommerce', 'checkout', 'testing', 'ux'],
    flow: {
      params: [
        { name: 'productUrl', type: 'string', required: true },
        { name: 'quantity', type: 'number', required: false, default: 1 },
      ],
      steps: [
        { type: 'goto', url: '{{productUrl}}', narrate: 'Navigating to product page' },
        { type: 'caption', text: 'Step 1: Add item to cart', placement: 'bottom' },
        { type: 'pause', ms: 800 },
        { type: 'click', selector: '[data-testid="add-to-cart"]', narrate: 'Clicking add to cart' },
        { type: 'waitFor', selector: '[data-testid="cart-badge"]', timeout: 5000 },
        { type: 'screenshot', label: 'item-added' },
        { type: 'caption', text: 'Step 2: View cart', placement: 'bottom' },
        { type: 'click', selector: '[data-testid="view-cart"]', narrate: 'Opening cart' },
        { type: 'waitFor', selector: '[data-testid="checkout-button"]', timeout: 5000 },
        { type: 'screenshot', label: 'cart-page' },
        { type: 'caption', text: 'Step 3: Checkout', placement: 'bottom' },
        {
          type: 'click',
          selector: '[data-testid="checkout-button"]',
          narrate: 'Starting checkout',
        },
        { type: 'waitFor', selector: '[data-testid="payment-form"]', timeout: 10000 },
        { type: 'screenshot', label: 'checkout-page' },
        { type: 'assertText', selector: '[data-testid="order-total"]', text: '$' },
      ],
    },
  },
];

// Export templates directly without validation to avoid deployment issues
export const templates: Template[] = templatesSeed as Template[];

export function getTemplateById(templateId: string): Template | undefined {
  return templates.find((t) => t.id === templateId);
}

export function applyTemplateParams(template: Template, params: Record<string, any>) {
  const replacer = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const raw = params[key];
        return raw === undefined || raw === null ? '' : String(raw);
      });
    }
    if (Array.isArray(value)) {
      return value.map(replacer);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replacer(v)]));
    }
    return value;
  };

  return {
    ...template,
    flow: {
      ...template.flow,
      steps: template.flow.steps.map((step) => replacer(step)),
    },
  };
}
