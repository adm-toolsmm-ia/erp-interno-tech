'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateDocumento } from '@/hooks/useDocumentos';
import { useProjetos } from '@/hooks/useProjetos';
import { useCategoriasDocumentos } from '@/hooks/useCategoriasDocumentos';
import { useAuth } from '@/contexts/AuthContext';

interface CreateDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateDocumentoModal({ isOpen, onClose, onSuccess }: CreateDocumentoModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'DOCUMENTO' as 'DOCUMENTO' | 'CONTRATO' | 'PROPOSTA' | 'RELATORIO' | 'OUTRO',
    categoriaId: '',
    projetoId: '',
    versao: '1.0',
    observacoes: '',
  });

  const { post, loading, error } = useCreateDocumento();
  const { data: projetos } = useProjetos();
  const { data: categorias } = useCategoriasDocumentos();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return;
    }
    
    const result = await post({
      ...formData,
      empresaId: user.empresaId,
    });

    if (result) {
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        tipo: 'DOCUMENTO',
        categoriaId: '',
        projetoId: '',
        versao: '1.0',
        observacoes: '',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Documento" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error.error.message}</p>
          </div>
        )}

        <div>
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Título do documento"
          />
        </div>

        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Descrição do documento"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="DOCUMENTO">Documento</option>
              <option value="CONTRATO">Contrato</option>
              <option value="PROPOSTA">Proposta</option>
              <option value="RELATORIO">Relatório</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div>
            <Label htmlFor="categoriaId">Categoria</Label>
            <select
              id="categoriaId"
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione uma categoria</option>
              {categorias?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="projetoId">Projeto</Label>
            <select
              id="projetoId"
              name="projetoId"
              value={formData.projetoId}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione um projeto</option>
              {projetos?.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.assunto}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="versao">Versão</Label>
            <Input
              id="versao"
              name="versao"
              value={formData.versao}
              onChange={handleChange}
              placeholder="1.0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Observações adicionais"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
