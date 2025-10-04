'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Building2, Users, FolderOpen, FileText, DollarSign, Flag, Tag, Package, Truck, LayoutDashboard, LogOut } from 'lucide-react';
import { navigationConfig } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const iconMap = {
  LayoutDashboard,
  Building2,
  Users,
  FolderOpen,
  FileText,
  DollarSign,
  Flag,
  Tag,
  Package,
  Truck,
} as const;

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Persistir estado no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-900 truncate">
              ERP Interno Tech
            </h1>
          )}
          <button
            onClick={toggleCollapsed}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigationConfig.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const IconComponent = item.icon ? iconMap[item.icon as keyof typeof iconMap] : null;
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md mx-2 transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {IconComponent && (
                      <IconComponent className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                    )}
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                {!isCollapsed && (
                  <div className="text-xs text-gray-500 mb-2">
                    <div>Versão 1.0.0</div>
                    <div>Multi-tenant</div>
                    <div className="mt-1 text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                )}
                <button
                  onClick={logout}
                  className={cn(
                    'flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors',
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? 'Sair' : undefined}
                >
                  <LogOut className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                  {!isCollapsed && <span className="truncate">Sair</span>}
                </button>
              </div>
    </div>
  );
}
