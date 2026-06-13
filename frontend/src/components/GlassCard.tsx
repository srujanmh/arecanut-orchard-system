import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function GlassCard({ children, className = '', hoverable = true }: GlassCardProps) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 ${
        hoverable ? 'glass-panel-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
