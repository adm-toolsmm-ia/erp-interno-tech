import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, Workflow, FileText } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <>
      <Topbar title="Configurações" />
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Configurações do Sistema</h1>
            <p className="text-gray-600 mb-8">
              Configure parâmetros e opções do sistema.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Workflow className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Status de Projetos</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Configure os status e fases dos projetos.
                </p>
                <Link href="/configuracoes/status-projetos">
                  <Button variant="outline" className="w-full">
                    Gerenciar Status
                  </Button>
                </Link>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Categorias de Documentos</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Configure as categorias de documentos.
                </p>
                <Link href="/configuracoes/categorias-documentos">
                  <Button variant="outline" className="w-full">
                    Gerenciar Categorias
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
