import React, { useState, useRef, useId } from 'react';

export function Tooltip({
  children,
  content,
  position = 'top',
}: {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const showTooltip = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let x = rect.left + rect.width / 2;
      let y = rect.top;

      switch (position) {
        case 'bottom':
          y = rect.bottom + 8;
          break;
        case 'left':
          x = rect.left - 8;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.right + 8;
          y = rect.top + rect.height / 2;
          break;
        default:
          y = rect.top - 8;
      }

      setCoords({ x, y });
    }
    setVisible(true);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setVisible(false)}
        onFocus={showTooltip}
        onBlur={() => setVisible(false)}
        aria-describedby={visible ? tooltipId : undefined}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </div>
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'fixed',
            left: coords.x,
            top: coords.y,
            transform:
              position === 'top'
                ? 'translate(-50%, -100%)'
                : position === 'bottom'
                  ? 'translate(-50%, 0)'
                  : position === 'left'
                    ? 'translate(-100%, -50%)'
                    : 'translate(0, -50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 12,
            maxWidth: 200,
            zIndex: 1050,
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
