import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  style,
  className = '',
  ...props
}: ButtonProps) {
  const getStyles = () => {
    let bg = 'transparent';
    let color = 'var(--text-primary)';
    let border = '1px solid var(--border)';
    let radius = 'var(--radius-12)';
    let padding = 'var(--space-8) var(--space-16)';
    let height = '44px'; // Minimum Touch Target 44px

    if (variant === 'primary') {
      bg = 'var(--primary)';
      color = '#FFFFFF';
      border = 'none';
    } else if (variant === 'danger') {
      bg = 'var(--danger)';
      color = '#FFFFFF';
      border = 'none';
    } else if (variant === 'ghost') {
      border = 'none';
    }

    if (size === 'sm') {
      padding = 'var(--space-8) var(--space-16)';
      radius = 'var(--radius-8)';
      height = '36px'; // smaller helper button
    } else if (size === 'lg') {
      padding = 'var(--space-16) var(--space-24)';
      radius = 'var(--radius-16)';
      height = '48px';
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-8)',
      backgroundColor: bg,
      color,
      border,
      borderRadius: radius,
      padding,
      height,
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.5 : 1,
      transition: 'background-color var(--transition-speed) var(--transition-ease), opacity var(--transition-speed) var(--transition-ease)',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--font-14)',
      fontWeight: 500,
      userSelect: 'none' as const,
      ...style
    };
  };

  return (
    <button
      style={getStyles()}
      className={`touch-target ${className}`}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
}
