import { ADVANCED_TEMPLATES } from './flowTemplateDataAdvanced';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  definition: any;
}

const CORE_TEMPLATES: Template[] = [
  {
    id: 'login-flow',
    name: 'Login Flow',
    description: 'Standard login flow with email and password authentication',
    category: 'Authentication',
    tags: ['login', 'auth', 'form'],
    definition: {
      params: [
        { name: 'email', type: 'string', required: true },
        { name: 'password', type: 'string', required: true },
      ],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/login', narrate: 'Opening login page' },
        { type: 'fill', elementId: 'email-input', value: '{{email}}', narrate: 'Entering email' },
        {
          type: 'fill',
          elementId: 'password-input',
          value: '{{password}}',
          narrate: 'Entering password',
        },
        { type: 'click', elementId: 'login-button', narrate: 'Clicking login' },
        { type: 'waitForNavigation', timeout: 10000 },
        { type: 'assertUrl', pattern: '/dashboard', narrate: 'Verifying successful login' },
      ],
    },
  },
  {
    id: 'checkout-flow',
    name: 'E-commerce Checkout',
    description: 'Complete checkout flow with cart, shipping, and payment',
    category: 'E-commerce',
    tags: ['checkout', 'cart', 'payment'],
    definition: {
      params: [{ name: 'productId', type: 'string', required: true }],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/product/{{productId}}', narrate: 'Opening product page' },
        { type: 'click', elementId: 'add-to-cart', narrate: 'Adding to cart' },
        { type: 'pause', ms: 1000 },
        { type: 'click', elementId: 'checkout-button', narrate: 'Proceeding to checkout' },
        { type: 'waitFor', elementId: 'shipping-form', state: 'visible' },
        { type: 'screenshot', label: 'checkout-page' },
      ],
    },
  },
  {
    id: 'search-flow',
    name: 'Search & Filter',
    description: 'Search for items and apply filters',
    category: 'Navigation',
    tags: ['search', 'filter', 'list'],
    definition: {
      params: [{ name: 'searchQuery', type: 'string', required: true }],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/search', narrate: 'Opening search page' },
        {
          type: 'fill',
          elementId: 'search-input',
          value: '{{searchQuery}}',
          narrate: 'Entering search query',
        },
        { type: 'keyboard', keys: 'Enter', narrate: 'Submitting search' },
        { type: 'waitForNetwork', urlPattern: '/api/search', timeout: 5000 },
        { type: 'screenshot', label: 'search-results' },
      ],
    },
  },
  {
    id: 'form-submission',
    name: 'Form Submission',
    description: 'Fill and submit a multi-field form',
    category: 'Forms',
    tags: ['form', 'input', 'submit'],
    definition: {
      params: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'message', type: 'string', required: false },
      ],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/contact', narrate: 'Opening contact form' },
        { type: 'fill', elementId: 'name-input', value: '{{name}}', narrate: 'Entering name' },
        { type: 'fill', elementId: 'email-input', value: '{{email}}', narrate: 'Entering email' },
        {
          type: 'fill',
          elementId: 'message-input',
          value: '{{message}}',
          narrate: 'Entering message',
        },
        { type: 'click', elementId: 'submit-button', narrate: 'Submitting form' },
        { type: 'waitFor', elementId: 'success-message', state: 'visible' },
        { type: 'assertText', text: 'Thank you', narrate: 'Verifying submission' },
      ],
    },
  },
  {
    id: 'data-export',
    name: 'Data Export',
    description: 'Navigate to reports and export data',
    category: 'Data',
    tags: ['export', 'download', 'report'],
    definition: {
      params: [{ name: 'reportType', type: 'string', required: true }],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/reports', narrate: 'Opening reports page' },
        { type: 'click', elementId: 'report-type-select', narrate: 'Opening report selector' },
        { type: 'click', elementId: 'report-{{reportType}}', narrate: 'Selecting report type' },
        { type: 'click', elementId: 'export-button', narrate: 'Clicking export' },
        { type: 'waitForNetwork', urlPattern: '/api/export', timeout: 30000 },
        { type: 'screenshot', label: 'export-complete' },
      ],
    },
  },
];

export const TEMPLATES: Template[] = [...CORE_TEMPLATES, ...ADVANCED_TEMPLATES];

export const CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))];
