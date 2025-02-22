import React from 'react';

export function Select({ className = '', ...props }) {
  return (
    <select
      className={`px-3 py-2 rounded-md border border-input bg-background text-sm ${className}`}
      {...props}
    />
  );
}