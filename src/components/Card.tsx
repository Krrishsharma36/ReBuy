import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  radius?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  radius = 'md',
  bordered = true,
  hoverable = false,
  style,
  className = '',
  ...props
}: CardProps) {
  const getRadius = () => {
    switch (radius) {
      case 'sm': return 'var(--radius-8)';
      case 'lg': return 'var(--radius-16)';
      case 'md':
      default: return 'var(--radius-12)';
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    border: bordered ? '1px solid var(--border)' : 'none',
    borderRadius: getRadius(),
    padding: 'var(--space-16)',
    transition: 'border-color var(--transition-speed) var(--transition-ease), background-color var(--transition-speed) var(--transition-ease), transform var(--transition-speed) var(--transition-ease)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-8)',
    cursor: hoverable ? 'pointer' : 'default',
    ...style
  };

  return (
    <div
      style={cardStyle}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
