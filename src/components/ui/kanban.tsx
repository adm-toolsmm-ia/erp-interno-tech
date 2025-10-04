'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  count: number;
  children: ReactNode;
  className?: string;
}

export function KanbanColumn({ title, count, children, className }: KanbanColumnProps) {
  return (
    <div className={cn('flex flex-col min-h-[500px]', className)}>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{count} itens</p>
      </div>
      <div className="flex-1 space-y-3">
        {children}
      </div>
    </div>
  );
}

interface KanbanCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function KanbanCard({ children, className, onClick }: KanbanCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface KanbanBoardProps {
  children: ReactNode;
  className?: string;
}

export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6', className)}>
      {children}
    </div>
  );
}
