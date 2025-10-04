'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { useProjetos } from '@/hooks/useProjetos';

interface EditProjetoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projetoId: string | null;
  onSuccess?: () => void;
}

export function EditProjetoModal({ isOpen, onClose, projetoId, onSuccess }: EditProjetoModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assunto: '',
    descricao: '',
  });

  // TODO: Implementar busca do projeto por ID para preencher o formulário
  useEffect(() => {
    if (projetoId && isOpen) {
      // Por enquanto, apenas limpar o formulário
      setFormData({
        assunto: '',
        descricao: '',
      });
    }
  }, [projetoId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetoId) return;

    setLoading(true);
    try {
      // TODO: Implementar chamada para API de atualização
      console.log('Atualizando projeto:', projetoId, formData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Projeto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="assunto">Assunto</Label>
          <Input
            id="assunto"
            value={formData.assunto}
            onChange={(e) => setFormData(prev => ({ ...prev, assunto: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
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
