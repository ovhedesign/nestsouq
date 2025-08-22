'use client';

export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
