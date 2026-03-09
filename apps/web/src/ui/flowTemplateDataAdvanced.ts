import type { Template } from './flowTemplateData';

export const ADVANCED_TEMPLATES: Template[] = [
  {
    id: 'user-profile',
    name: 'Profile Update',
    description: 'Update user profile information',
    category: 'User Management',
    tags: ['profile', 'settings', 'update'],
    definition: {
      params: [{ name: 'displayName', type: 'string', required: true }],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/settings/profile', narrate: 'Opening profile settings' },
        { type: 'clearInput', elementId: 'display-name', narrate: 'Clearing current name' },
        {
          type: 'fill',
          elementId: 'display-name',
          value: '{{displayName}}',
          narrate: 'Entering new name',
        },
        { type: 'click', elementId: 'save-button', narrate: 'Saving changes' },
        { type: 'waitFor', elementId: 'success-toast', state: 'visible' },
        { type: 'screenshot', label: 'profile-updated' },
      ],
    },
  },
  {
    id: 'mobile-responsive',
    name: 'Mobile Responsive Test',
    description: 'Test page on multiple device sizes',
    category: 'Testing',
    tags: ['mobile', 'responsive', 'viewport'],
    definition: {
      params: [{ name: 'pageUrl', type: 'string', required: true }],
      steps: [
        { type: 'goto', url: '{{pageUrl}}', narrate: 'Opening page' },
        { type: 'setViewport', width: 1920, height: 1080, narrate: 'Desktop view' },
        { type: 'screenshot', label: 'desktop' },
        { type: 'emulateDevice', device: 'iPad', narrate: 'Tablet view' },
        { type: 'screenshot', label: 'tablet' },
        { type: 'emulateDevice', device: 'iPhone 14', narrate: 'Mobile view' },
        { type: 'screenshot', label: 'mobile' },
      ],
    },
  },
  {
    id: 'drag-drop-test',
    name: 'Drag and Drop',
    description: 'Test drag and drop functionality',
    category: 'Testing',
    tags: ['drag', 'drop', 'interaction'],
    definition: {
      params: [],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/kanban', narrate: 'Opening kanban board' },
        {
          type: 'dragDrop',
          sourceElementId: 'task-1',
          targetElementId: 'column-done',
          narrate: 'Moving task to done',
        },
        { type: 'pause', ms: 500 },
        { type: 'screenshot', label: 'after-drag' },
      ],
    },
  },
  {
    id: 'pagination-test',
    name: 'Pagination Test',
    description: 'Navigate through paginated content',
    category: 'Testing',
    tags: ['pagination', 'navigation', 'list'],
    definition: {
      params: [],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/items', narrate: 'Opening items list' },
        { type: 'screenshot', label: 'page-1' },
        {
          type: 'loop',
          times: 3,
          steps: [
            { type: 'click', elementId: 'next-page', narrate: 'Going to next page' },
            { type: 'waitForNetwork', timeout: 5000 },
            { type: 'screenshot', label: 'page' },
          ],
        },
      ],
    },
  },
  {
    id: 'conditional-flow',
    name: 'Conditional Logic',
    description: 'Flow with conditional branching',
    category: 'Advanced',
    tags: ['conditional', 'logic', 'branching'],
    definition: {
      params: [{ name: 'userType', type: 'string', required: true }],
      steps: [
        { type: 'goto', url: '{{baseUrl}}/dashboard', narrate: 'Opening dashboard' },
        {
          type: 'conditional',
          condition: "document.querySelector('.admin-badge') !== null",
          thenSteps: [{ type: 'click', elementId: 'admin-panel', narrate: 'Opening admin panel' }],
          elseSteps: [
            { type: 'click', elementId: 'user-profile', narrate: 'Opening user profile' },
          ],
        },
      ],
    },
  },
];
