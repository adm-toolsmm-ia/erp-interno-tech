import Topbar from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ProdutosServicosPage() {
  return (
    <>
      <Topbar 
        title="Produtos/Serviços" 
        actions={
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Novo Produto/Serviço
          </Button>
        } 
      />
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produtos e Serviços</h1>
            <p className="text-gray-600 mb-6">
              Gerencie produtos e serviços oferecidos.
            </p>
            
            {/* TODO: Implementar DataTable de produtos/serviços */}
            <div className="text-center py-12 text-gray-500">
              <p>DataTable de produtos/serviços será implementada aqui</p>
              <p className="text-sm mt-2">Com colunas: Nome, Tipo, Descrição, Preço, Ações</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
