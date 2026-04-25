import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-cyan-400/90 text-slate-900 hover:bg-cyan-300 disabled:bg-cyan-400/40 shadow-[0_8px_24px_rgba(34,211,238,0.25)]',
  secondary: 'bg-slate-700/50 text-slate-100 hover:bg-slate-700 disabled:bg-slate-700/30',
  outline:
    'border border-slate-600/70 text-slate-100 hover:bg-slate-800/40 disabled:bg-slate-800/20',
  ghost: 'text-slate-200 hover:bg-slate-800/40 disabled:bg-transparent',
  danger: 'bg-rose-500 text-white hover:bg-rose-400 disabled:bg-rose-500/40',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        ${isLoading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
      `}
      {...props}
    >
      {isLoading ? <span className="animate-spin mr-2">⟳</span> : null}
      {children}
    </button>
  );
}
