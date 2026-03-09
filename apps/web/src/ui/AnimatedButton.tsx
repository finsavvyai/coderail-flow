import React, { useState } from 'react';

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  [key: string]: any;
}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.();
  };

  const colors = {
    primary: { bg: '#3b82f6', hover: '#2563eb', text: '#fff' },
    secondary: { bg: '#2a2a2a', hover: '#3a3a3a', text: '#fff' },
    danger: { bg: '#ef4444', hover: '#dc2626', text: '#fff' },
    ghost: { bg: 'transparent', hover: '#2a2a2a', text: '#888' },
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12, minHeight: 44 },
    md: { padding: '8px 16px', fontSize: 14, minHeight: 44 },
    lg: { padding: '12px 24px', fontSize: 16, minHeight: 44 },
  };

  const color = colors[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: color.bg,
        color: color.text,
        border: 'none',
        borderRadius: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontWeight: 500,
        ...sizeStyle,
        ...props.style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = color.hover;
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.25)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = color.bg;
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {loading && (
        <span
          className="spin"
          style={{
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
          }}
        />
      )}
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 0.6s ease-out',
          }}
        />
      ))}
    </button>
  );
}

export function AnimatedCard({
  children,
  onClick,
  selected = false,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  [key: string]: any;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        border: `1px solid ${selected ? '#3b82f6' : '#2a2a2a'}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...props.style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
          e.currentTarget.style.borderColor = '#3b82f6';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = selected ? '#3b82f6' : '#2a2a2a';
      }}
      {...props}
    >
      {children}
    </div>
  );
}
