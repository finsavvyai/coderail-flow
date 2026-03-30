import React, { useState } from 'react';

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
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

  const classes = [
    'btn-animated',
    `btn-animated--${variant}`,
    `btn-animated--${size}`,
    disabled ? 'btn-animated--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && <span className="btn-animated-spinner spin" />}
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="btn-animated-ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </button>
  );
}

export function AnimatedCard({
  children,
  onClick,
  selected = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const classes = [
    'animated-card',
    selected ? 'animated-card--selected' : '',
    onClick ? 'animated-card--clickable' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div onClick={onClick} className={classes} {...props}>
      {children}
    </div>
  );
}
