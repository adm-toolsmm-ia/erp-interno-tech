'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export default function Topbar({ title, subtitle, actions, className }: TopbarProps) {
  return (
    <header className={cn('bg-white border-b border-gray-200 px-6 py-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3 ml-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
