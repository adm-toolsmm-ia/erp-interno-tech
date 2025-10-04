'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateStatusProjeto } from '@/hooks/useStatusProjetos';
import { useAuth } from '@/contexts/AuthContext';

interface CreateStatusProjetoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateStatusProjetoModal({ isOpen, onClose, onSuccess }: CreateStatusProjetoModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    fase: 'INICIO' as 'INICIO' | 'DESENVOLVIMENTO' | 'TESTE' | 'ENTREGA' | 'FINALIZADO',
    cor: '#3B82F6',
    ordem: 1,
    ativo: true,
  });

  const { post, loading, error } = useCreateStatusProjeto();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return;
    }
    
    const result = await post({
      ...formData,
      ordem: Number(formData.ordem),
      empresaId: user.empresaId,
    });

    if (result) {
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        nome: '',
        descricao: '',
        fase: 'INICIO',
        cor: '#3B82F6',
        ordem: 1,
        ativo: true,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Status de Projeto" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error.error.message}</p>
          </div>
        )}

        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Nome do status"
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
            placeholder="Descrição do status"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fase">Fase *</Label>
            <select
              id="fase"
              name="fase"
              value={formData.fase}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="INICIO">Início</option>
              <option value="DESENVOLVIMENTO">Desenvolvimento</option>
              <option value="TESTE">Teste</option>
              <option value="ENTREGA">Entrega</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>

          <div>
            <Label htmlFor="ordem">Ordem</Label>
            <Input
              id="ordem"
              name="ordem"
              type="number"
              min="1"
              value={formData.ordem}
              onChange={handleChange}
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="cor">Cor</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="cor"
                name="cor"
                type="color"
                value={formData.cor}
                onChange={handleChange}
                className="w-16 h-10 p-1"
              />
              <Input
                value={formData.cor}
                onChange={handleChange}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="ativo"
              name="ativo"
              type="checkbox"
              checked={formData.ativo}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="ativo">Status ativo</Label>
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
