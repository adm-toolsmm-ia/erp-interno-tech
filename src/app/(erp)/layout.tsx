import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';

interface ErpLayoutProps {
  children: ReactNode;
}

export default function ErpLayout({ children }: ErpLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
