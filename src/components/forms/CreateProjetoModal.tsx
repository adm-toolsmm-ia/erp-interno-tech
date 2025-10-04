'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateProjeto } from '@/hooks/useProjetos';
import { useClientes } from '@/hooks/useClientes';
import { useAuth } from '@/contexts/AuthContext';

interface CreateProjetoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProjetoModal({ isOpen, onClose, onSuccess }: CreateProjetoModalProps) {
  const [formData, setFormData] = useState({
    assunto: '',
    descricao: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    dataInicio: '',
    dataFim: '',
    orcamento: '',
    prioridade: 'MEDIA' as 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE',
    clienteId: '',
  });

  const { post, loading, error } = useCreateProjeto();
  const { data: clientes } = useClientes();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return;
    }
    
    const result = await post({
      ...formData,
      orcamento: formData.orcamento ? parseFloat(formData.orcamento) : undefined,
      dataInicio: formData.dataInicio ? new Date(formData.dataInicio).toISOString() : undefined,
      dataFim: formData.dataFim ? new Date(formData.dataFim).toISOString() : undefined,
      empresaId: user.empresaId,
    });

    if (result) {
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        assunto: '',
        descricao: '',
        dataEntrada: new Date().toISOString().split('T')[0],
        dataInicio: '',
        dataFim: '',
        orcamento: '',
        prioridade: 'MEDIA',
        clienteId: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Projeto" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error.error.message}</p>
          </div>
        )}

        <div>
          <Label htmlFor="assunto">Assunto *</Label>
          <Input
            id="assunto"
            name="assunto"
            value={formData.assunto}
            onChange={handleChange}
            required
            placeholder="Título do projeto"
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
            placeholder="Descrição detalhada do projeto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clienteId">Cliente *</Label>
            <select
              id="clienteId"
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione um cliente</option>
              {clientes?.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="prioridade">Prioridade</Label>
            <select
              id="prioridade"
              name="prioridade"
              value={formData.prioridade}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          <div>
            <Label htmlFor="dataEntrada">Data de Entrada *</Label>
            <Input
              id="dataEntrada"
              name="dataEntrada"
              type="date"
              value={formData.dataEntrada}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="orcamento">Orçamento (R$)</Label>
            <Input
              id="orcamento"
              name="orcamento"
              type="number"
              step="0.01"
              value={formData.orcamento}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="dataInicio">Data de Início</Label>
            <Input
              id="dataInicio"
              name="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="dataFim">Data de Fim</Label>
            <Input
              id="dataFim"
              name="dataFim"
              type="date"
              value={formData.dataFim}
              onChange={handleChange}
            />
          </div>
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
