/**
 * Overlay injection for flow execution.
 *
 * Injects a minimal highlight/caption library into the browser page.
 */

export async function injectOverlay(page: any): Promise<void> {
  await page.evaluateOnNewDocument(() => {
    (window as any).coderail = {
      highlight: (selector: string, options?: any) => {
        const element = document.querySelector(selector);
        if (!element) {
          console.warn(`[CodeRail] Element not found: ${selector}`);
          return null;
        }

        const rect = element.getBoundingClientRect();
        const id = `coderail-hl-${Date.now()}`;
        const container = ensureOverlayContainer();

        const highlightEl = document.createElement('div');
        highlightEl.id = id;
        highlightEl.style.cssText = `
          position: fixed;
          left: ${rect.left - 4}px;
          top: ${rect.top - 4}px;
          width: ${rect.width + 8}px;
          height: ${rect.height + 8}px;
          border: 3px solid #3b82f6;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.1);
          pointer-events: none;
          z-index: 2147483647;
          animation: ${options?.style === 'pulse' ? 'coderail-pulse 1.5s infinite' : 'none'};
        `;

        container.appendChild(highlightEl);

        if (options?.duration) {
          setTimeout(() => highlightEl.remove(), options.duration);
        }

        return id;
      },

      caption: (text: string, options?: any) => {
        const id = `coderail-cap-${Date.now()}`;
        const container = ensureOverlayContainer();

        const captionEl = document.createElement('div');
        captionEl.id = id;
        captionEl.textContent = text;

        const placement = options?.placement || 'bottom';
        const positionStyle =
          placement === 'bottom'
            ? 'bottom: 20px; left: 50%; transform: translateX(-50%);'
            : placement === 'top'
              ? 'top: 20px; left: 50%; transform: translateX(-50%);'
              : 'top: 50%; left: 50%; transform: translate(-50%, -50%);';

        captionEl.style.cssText = `
          position: fixed;
          ${positionStyle}
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-family: system-ui, -apple-system, sans-serif;
          pointer-events: none;
          z-index: 2147483647;
          max-width: 80%;
          text-align: center;
        `;

        container.appendChild(captionEl);

        if (options?.duration) {
          setTimeout(() => captionEl.remove(), options.duration);
        }

        return id;
      },

      clear: () => {
        const container = document.getElementById('coderail-overlay-container');
        if (container) container.innerHTML = '';
      },
    };

    function ensureOverlayContainer() {
      let container = document.getElementById('coderail-overlay-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'coderail-overlay-container';
        container.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2147483646;
        `;

        const style = document.createElement('style');
        style.textContent = `
          @keyframes coderail-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(container);
      }
      return container;
    }
  });
}
