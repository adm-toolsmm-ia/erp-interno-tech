'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCategoriaDocumento } from '@/hooks/useCategoriasDocumentos';
import { useAuth } from '@/contexts/AuthContext';

interface CreateCategoriaDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCategoriaDocumentoModal({ isOpen, onClose, onSuccess }: CreateCategoriaDocumentoModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6',
    icone: '📄',
    ativo: true,
  });

  const { post, loading, error } = useCreateCategoriaDocumento();
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
        nome: '',
        descricao: '',
        cor: '#3B82F6',
        icone: '📄',
        ativo: true,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const icones = ['📄', '📋', '📊', '📈', '📉', '📝', '📑', '📃', '📜', '📰', '📓', '📔', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🏷️'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Categoria de Documento" size="lg">
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
            placeholder="Nome da categoria"
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
            placeholder="Descrição da categoria"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="icone">Ícone</Label>
            <div className="space-y-2">
              <Input
                id="icone"
                name="icone"
                value={formData.icone}
                onChange={handleChange}
                placeholder="📄"
                maxLength={2}
              />
              <div className="flex flex-wrap gap-2">
                {icones.map((icone) => (
                  <button
                    key={icone}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icone }))}
                    className={`p-2 rounded border text-lg hover:bg-gray-50 ${
                      formData.icone === icone ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                    }`}
                  >
                    {icone}
                  </button>
                ))}
              </div>
            </div>
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
          <Label htmlFor="ativo">Categoria ativa</Label>
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
