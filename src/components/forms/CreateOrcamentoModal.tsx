'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateOrcamento } from '@/hooks/useOrcamentos';
import { useProjetos } from '@/hooks/useProjetos';
import { useAuth } from '@/contexts/AuthContext';

interface CreateOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateOrcamentoModal({ isOpen, onClose, onSuccess }: CreateOrcamentoModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    moeda: 'BRL',
    status: 'RASCUNHO' as 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO',
    projetoId: '',
    dataValidade: '',
    observacoes: '',
  });

  const { post, loading, error } = useCreateOrcamento();
  const { data: projetos } = useProjetos();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return;
    }
    
    const result = await post({
      ...formData,
      valor: formData.valor ? parseFloat(formData.valor) : undefined,
      dataValidade: formData.dataValidade ? new Date(formData.dataValidade).toISOString() : undefined,
      empresaId: user.empresaId,
    });

    if (result) {
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        valor: '',
        moeda: 'BRL',
        status: 'RASCUNHO',
        projetoId: '',
        dataValidade: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Orçamento" size="lg">
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
            placeholder="Título do orçamento"
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
            placeholder="Descrição do orçamento"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projetoId">Projeto *</Label>
            <select
              id="projetoId"
              name="projetoId"
              value={formData.projetoId}
              onChange={handleChange}
              required
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
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="RASCUNHO">Rascunho</option>
              <option value="ENVIADO">Enviado</option>
              <option value="APROVADO">Aprovado</option>
              <option value="REJEITADO">Rejeitado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="moeda">Moeda</Label>
            <select
              id="moeda"
              name="moeda"
              value={formData.moeda}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="BRL">BRL (Real)</option>
              <option value="USD">USD (Dólar)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="dataValidade">Data de Validade</Label>
            <Input
              id="dataValidade"
              name="dataValidade"
              type="date"
              value={formData.dataValidade}
              onChange={handleChange}
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
