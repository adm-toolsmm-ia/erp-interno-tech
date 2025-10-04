import Topbar from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function FornecedoresPage() {
  return (
    <>
      <Topbar 
        title="Fornecedores" 
        actions={
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Novo Fornecedor
          </Button>
        } 
      />
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Fornecedores</h1>
            <p className="text-gray-600 mb-6">
              Gerencie fornecedores e parceiros.
            </p>
            
            {/* TODO: Implementar DataTable de fornecedores */}
            <div className="text-center py-12 text-gray-500">
              <p>DataTable de fornecedores será implementada aqui</p>
              <p className="text-sm mt-2">Com colunas: Nome, CNPJ, Contato, Status, Ações</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
