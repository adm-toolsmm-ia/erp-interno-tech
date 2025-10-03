import { ReactNode } from 'react';

interface ErpLayoutProps {
  children: ReactNode;
}

export default function ErpLayout({ children }: ErpLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">ERP Interno Tech</h1>
          </div>
          <nav className="mt-6">
            <div className="px-6 py-2">
              <a href="/dashboard" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                Dashboard
              </a>
              <a href="/empresas" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                Empresas
              </a>
              <a href="/clientes" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                Clientes
              </a>
              <a href="/projetos" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                Projetos
              </a>
              <a href="/documentos" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                Documentos
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
