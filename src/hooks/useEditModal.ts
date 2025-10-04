import { useState } from 'react';

interface UseEditModalOptions {
  entityName: string;
  onSuccess?: () => void;
}

export function useEditModal({ entityName, onSuccess }: UseEditModalOptions) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openEditModal = (id: string) => {
    setEditingId(id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
  };

  const handleEditSuccess = () => {
    closeEditModal();
    onSuccess?.();
  };

  return {
    isEditModalOpen,
    editingId,
    openEditModal,
    closeEditModal,
    handleEditSuccess,
  };
}
