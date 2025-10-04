'use client';

import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, FileText, DollarSign, AlertCircle } from 'lucide-react';
import { useProjetos } from '@/hooks/useProjetos';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';
import { z } from 'zod';
import { updateProjetoSchema } from '@/lib/validations';

interface EditProjetoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projetoId: string | null;
  onSuccess: () => void;
}

interface ProjetoData {
  id: string;
  assunto: string;
  descricao?: string;
  statusId?: string;
  clienteId?: string;
  dataInicio?: string;
  dataFim?: string;
  valorTotal?: number;
  moeda?: string;
  createdAt: string;
  updatedAt: string;
  status?: {
    id: string;
    nome: string;
    cor: string;
  };
  cliente?: {
    id: string;
    razaoSocial: string;
  };
}

export function EditProjetoDrawer({ isOpen, onClose, projetoId, onSuccess }: EditProjetoDrawerProps) {
  const [formData, setFormData] = useState<Partial<ProjetoData>>({});
  const [loading, setLoading] = useState(false);
  const [projetoData, setProjetoData] = useState<ProjetoData | null>(null);
  
  const { getProjetoById, updateProjeto } = useApi();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen && projetoId) {
      fetchProjeto();
    }
  }, [isOpen, projetoId]);

  const fetchProjeto = async () => {
    try {
      setLoading(true);
      const response = await getProjetoById(projetoId!);
      if (response.data) {
        setProjetoData(response.data);
        setFormData({
          assunto: response.data.assunto,
          descricao: response.data.descricao || '',
          statusId: response.data.statusId,
          clienteId: response.data.clienteId,
          dataInicio: response.data.dataInicio ? response.data.dataInicio.split('T')[0] : '',
          dataFim: response.data.dataFim ? response.data.dataFim.split('T')[0] : '',
          valorTotal: response.data.valorTotal,
          moeda: response.data.moeda || 'BRL',
        });
      }
    } catch (error) {
      console.error('Failed to fetch projeto:', error);
      showError('Erro ao carregar dados do projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetoId) return;

    try {
      setLoading(true);
      
      // Validate with Zod
      const validatedData = updateProjetoSchema.parse(formData);
      
      await updateProjeto(projetoId, validatedData);
      showSuccess('Projeto atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        showError('Dados inválidos. Verifique os campos obrigatórios.');
      } else {
        console.error('Failed to update projeto:', error);
        showError('Erro ao atualizar projeto');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!projetoData && !loading) {
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-w-4xl mx-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editar Projeto
          </DrawerTitle>
          <DrawerDescription>
            Faça as alterações necessárias no projeto. As mudanças serão salvas automaticamente.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="timeline">Cronograma</TabsTrigger>
              <TabsTrigger value="budget">Orçamento</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assunto">Assunto *</Label>
                      <Input
                        id="assunto"
                        value={formData.assunto || ''}
                        onChange={(e) => handleChange('assunto', e.target.value)}
                        placeholder="Título do projeto"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="statusId">Status</Label>
                      <Select value={formData.statusId || ''} onValueChange={(value) => handleChange('statusId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Planejamento</SelectItem>
                          <SelectItem value="2">Em Andamento</SelectItem>
                          <SelectItem value="3">Concluído</SelectItem>
                          <SelectItem value="4">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao || ''}
                      onChange={(e) => handleChange('descricao', e.target.value)}
                      placeholder="Descrição detalhada do projeto"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clienteId">Cliente</Label>
                    <Select value={formData.clienteId || ''} onValueChange={(value) => handleChange('clienteId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Cliente A</SelectItem>
                        <SelectItem value="2">Cliente B</SelectItem>
                        <SelectItem value="3">Cliente C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Cronograma
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={formData.dataInicio || ''}
                        onChange={(e) => handleChange('dataInicio', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataFim">Data de Fim</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={formData.dataFim || ''}
                        onChange={(e) => handleChange('dataFim', e.target.value)}
                      />
                    </div>
                  </div>

                  {projetoData && (
                    <div className="space-y-2">
                      <Label>Progresso</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
                        </div>
                        <span className="text-sm text-gray-600">33%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Orçamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valorTotal">Valor Total</Label>
                      <Input
                        id="valorTotal"
                        type="number"
                        step="0.01"
                        value={formData.valorTotal || ''}
                        onChange={(e) => handleChange('valorTotal', parseFloat(e.target.value))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="moeda">Moeda</Label>
                      <Select value={formData.moeda || 'BRL'} onValueChange={(value) => handleChange('moeda', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">BRL (R$)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Histórico de Alterações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projetoData && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Projeto criado</p>
                          <p className="text-xs text-gray-600">
                            {new Date(projetoData.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="secondary">Criação</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Última atualização</p>
                          <p className="text-xs text-gray-600">
                            {new Date(projetoData.updatedAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="secondary">Atualização</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
