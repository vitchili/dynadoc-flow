import React, { useEffect, useState, useCallback } from 'react';
import { Plus, FileText, Calendar, ChevronDown, ChevronUp, Edit, Trash2, Upload, Loader2, Search, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Contract, Section, Tag, CreateContractData, CreateSectionData, ContractsResponse } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Editor from '@/components/Editor';
import ImportSectionModal from '@/components/ImportSectionModal';
import DraggableSection from '@/components/DraggableSection';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contractsData, setContractsData] = useState<ContractsResponse>({
    contracts: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [expandedContracts, setExpandedContracts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showEditContractModal, setShowEditContractModal] = useState(false);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // Form states
  const [newContractData, setNewContractData] = useState<CreateContractData>({
    name: '',
    description: ''
  });
  const [newSectionData, setNewSectionData] = useState<CreateSectionData>({
    title: '',
    description: '',
    content: '',
    contractId: ''
  });

  useEffect(() => {
    loadContracts();
    loadTags();
  }, [user, currentPage, searchQuery]);

  const loadContracts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let response: ContractsResponse;
      
      if (searchQuery.trim()) {
        response = await api.filterContracts(user.id, searchQuery, currentPage, 10);
      } else {
        response = await api.getContracts(user.id, currentPage, 10);
      }
      
      setContractsData(response);
    } catch (error) {
      toast({
        title: "Erro ao carregar contratos",
        description: "Não foi possível carregar seus contratos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    if (!user) return;
    
    try {
      const tagsData = await api.getTags(user.id);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadSections = async (contractId: string) => {
    try {
      setSectionsLoading(true);
      const sectionsData = await api.getSections(contractId);
      setSections(sectionsData);
    } catch (error) {
      toast({
        title: "Erro ao carregar seções",
        description: "Não foi possível carregar as seções do contrato.",
        variant: "destructive",
      });
    } finally {
      setSectionsLoading(false);
    }
  };

  const moveSection = useCallback(async (dragIndex: number, hoverIndex: number) => {
    if (!selectedContract) return;

    const dragSection = sections[dragIndex];
    const hoverSection = sections[hoverIndex];
    
    // Reorder sections array locally for immediate UI feedback
    const newSections = [...sections];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, dragSection);
    
    // Update order property based on new positions
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));
    
    setSections(updatedSections);

    try {
      // Update order in backend
      await api.updateSectionOrder(selectedContract.id, updatedSections.map(s => ({ id: s.id, order: s.order })));
      toast({
        title: "Ordem atualizada!",
        description: "A ordem das seções foi atualizada com sucesso.",
      });
    } catch (error) {
      // Revert changes on error
      setSections(sections);
      toast({
        title: "Erro ao reordenar",
        description: "Não foi possível atualizar a ordem das seções.",
        variant: "destructive",
      });
    }
  }, [sections, selectedContract, toast]);

  const handleContractClick = async (contract: Contract) => {
    setSelectedContract(contract);
    
    if (expandedContracts.has(contract.id)) {
      setExpandedContracts(prev => {
        const newSet = new Set(prev);
        newSet.delete(contract.id);
        return newSet;
      });
      setSections([]);
    } else {
      setExpandedContracts(prev => new Set([...prev, contract.id]));
      await loadSections(contract.id);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateContract = async () => {
    if (!user || !newContractData.name.trim()) return;

    try {
      const contract = await api.createContract(newContractData);
      await loadContracts();
      setNewContractData({ name: '', description: '' });
      setShowNewContractModal(false);
      toast({
        title: "Contrato criado!",
        description: "Seu novo contrato foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar contrato",
        description: "Não foi possível criar o contrato.",
        variant: "destructive",
      });
    }
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setNewContractData({
      name: contract.name,
      description: contract.description
    });
    setShowEditContractModal(true);
  };

  const handleUpdateContract = async () => {
    if (!editingContract) return;

    try {
      const updatedContract = await api.updateContract(editingContract.id, newContractData);
      await loadContracts();
      setEditingContract(null);
      setNewContractData({ name: '', description: '' });
      setShowEditContractModal(false);
      toast({
        title: "Contrato atualizado!",
        description: "O contrato foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar contrato",
        description: "Não foi possível atualizar o contrato.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSection = async () => {
    if (!selectedContract || !newSectionData.title.trim()) return;

    try {
      const sectionData = {
        ...newSectionData,
        contractId: selectedContract.id
      };
      const section = await api.createSection(sectionData);
      setSections(prev => [...prev, section]);
      setNewSectionData({ title: '', description: '', content: '', contractId: '' });
      setShowNewSectionModal(false);
      toast({
        title: "Seção criada!",
        description: "A nova seção foi criada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar seção",
        description: "Não foi possível criar a seção.",
        variant: "destructive",
      });
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setNewSectionData({
      title: section.title,
      description: section.description,
      content: section.content,
      contractId: section.contractId
    });
    setShowEditSectionModal(true);
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;

    try {
      const updatedSection = await api.updateSection(editingSection.id, newSectionData);
      setSections(prev => prev.map(s => s.id === editingSection.id ? updatedSection : s));
      setEditingSection(null);
      setNewSectionData({ title: '', description: '', content: '', contractId: '' });
      setShowEditSectionModal(false);
      toast({
        title: "Seção atualizada!",
        description: "A seção foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar seção",
        description: "Não foi possível atualizar a seção.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta seção?')) return;

    try {
      await api.deleteSection(sectionId);
      setSections(prev => prev.filter(s => s.id !== sectionId));
      toast({
        title: "Seção excluída!",
        description: "A seção foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir seção",
        description: "Não foi possível excluir a seção.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteContract = async (contractId: string, contractName: string) => {
    try {
      await api.deleteContract(contractId);
      await loadContracts();
      toast({
        title: "Contrato excluído!",
        description: "O contrato e suas seções foram excluídos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir contrato",
        description: "Não foi possível excluir o contrato.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExample = async (contractId: string) => {
    try {
      await api.downloadContractExample(contractId);
      toast({
        title: "Download iniciado!",
        description: "O download do modelo será processado.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o modelo do contrato.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Meus Documentos</h1>
            <p className="text-gray-300 mt-2">Gerencie seus contratos e seções</p>
          </div>
          
          <Dialog open={showNewContractModal} onOpenChange={setShowNewContractModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-white/20">
              <DialogHeader>
                <DialogTitle>Criar Novo Contrato</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo contrato
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contract-name">Nome do Contrato</Label>
                  <Input
                    id="contract-name"
                    placeholder="Ex: Contrato de Prestação de Serviços"
                    value={newContractData.name}
                    onChange={(e) => setNewContractData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="glass bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="contract-description">Descrição</Label>
                  <Textarea
                    id="contract-description"
                    placeholder="Descreva o propósito deste contrato..."
                    value={newContractData.description}
                    onChange={(e) => setNewContractData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="glass bg-white/5 border-white/20"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewContractModal(false)}
                    className="border-white/20"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateContract}
                    disabled={!newContractData.name.trim()}
                    className="bg-gradient-to-r from-gray-500 to-gray-700"
                  >
                    Criar Contrato
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="flex space-x-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar contratos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-10 glass bg-white/5 border-white/20"
            />
          </div>
          <Button
            onClick={handleSearch}
            variant="outline"
            className="border-white/20"
          >
            Pesquisar
          </Button>
        </div>

        {contractsData.contracts.length === 0 ? (
          <Card className="glass-card border-white/20 text-center py-12">
            <CardHeader>
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <CardTitle>Nenhum contrato encontrado</CardTitle>
              <CardDescription>
                {searchQuery ? 'Nenhum contrato corresponde à sua pesquisa' : 'Crie seu primeiro contrato para começar a organizar seus documentos'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {contractsData.contracts.map((contract) => (
                <Card key={contract.id} className="glass-card border-white/20">
                  <Collapsible
                    open={expandedContracts.has(contract.id)}
                    onOpenChange={() => handleContractClick(contract)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-gray-400" />
                            <div>
                              <CardTitle className="text-left">{contract.name}</CardTitle>
                              <CardDescription className="text-left mt-1">
                                {contract.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadExample(contract.id);
                                }}
                                className="text-gray-400 hover:text-gray-300"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditContract(contract);
                                }}
                                className="text-gray-400 hover:text-gray-300"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass-strong border-white/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o contrato "{contract.name}" e todas as suas seções? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-white/20">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteContract(contract.id, contract.name)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <div className="text-sm text-gray-400 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(contract.updatedAt)}
                            </div>
                            {expandedContracts.has(contract.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="border-t border-white/20 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Seções do Contrato</h3>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setShowImportModal(true);
                                }}
                                className="border-white/20"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Importar Seção
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setNewSectionData({ title: '', description: '', content: '', contractId: contract.id });
                                  setShowNewSectionModal(true);
                                }}
                                className="bg-gradient-to-r from-gray-500 to-gray-700"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Seção
                              </Button>
                            </div>
                          </div>

                          {sectionsLoading && selectedContract?.id === contract.id ? (
                            <div className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                              <p className="text-gray-400">Carregando seções...</p>
                            </div>
                          ) : sections.length === 0 && selectedContract?.id === contract.id ? (
                            <div className="text-center py-8 text-gray-400">
                              <p>Nenhuma seção criada ainda</p>
                            </div>
                          ) : (
                            selectedContract?.id === contract.id && (
                              <div className="space-y-3">
                                {sections
                                  .sort((a, b) => a.order - b.order)
                                  .map((section, index) => (
                                    <DraggableSection
                                      key={section.id}
                                      section={section}
                                      index={index}
                                      onEdit={handleEditSection}
                                      onDelete={handleDeleteSection}
                                      onMove={moveSection}
                                    />
                                  ))}
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {contractsData.totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: contractsData.totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(contractsData.totalPages, currentPage + 1))}
                      className={currentPage === contractsData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Modal Nova Seção */}
        <Dialog open={showNewSectionModal} onOpenChange={setShowNewSectionModal}>
          <DialogContent className="glass-strong border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Seção</DialogTitle>
              <DialogDescription>
                Adicione uma nova seção ao contrato "{selectedContract?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section-title">Título da Seção</Label>
                <Input
                  id="section-title"
                  placeholder="Ex: Cláusulas Gerais"
                  value={newSectionData.title}
                  onChange={(e) => setNewSectionData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="glass bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="section-description">Descrição Breve</Label>
                <Input
                  id="section-description"
                  placeholder="Ex: Estabelece as condições gerais entre as partes"
                  value={newSectionData.description}
                  onChange={(e) => setNewSectionData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="glass bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>Conteúdo da Seção</Label>
                <Editor
                  content={newSectionData.content}
                  onChange={(content) => setNewSectionData(prev => ({
                    ...prev,
                    content
                  }))}
                  tags={tags}
                  placeholder="Digite o conteúdo da seção..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewSectionModal(false)}
                  className="border-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateSection}
                  disabled={!newSectionData.title.trim()}
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                >
                  Criar Seção
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Contrato */}
        <Dialog open={showEditContractModal} onOpenChange={setShowEditContractModal}>
          <DialogContent className="glass-strong border-white/20">
            <DialogHeader>
              <DialogTitle>Editar Contrato</DialogTitle>
              <DialogDescription>
                Edite as informações do contrato "{editingContract?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-contract-name">Nome do Contrato</Label>
                <Input
                  id="edit-contract-name"
                  placeholder="Ex: Contrato de Prestação de Serviços"
                  value={newContractData.name}
                  onChange={(e) => setNewContractData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="glass bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-contract-description">Descrição</Label>
                <Textarea
                  id="edit-contract-description"
                  placeholder="Descreva o propósito deste contrato..."
                  value={newContractData.description}
                  onChange={(e) => setNewContractData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="glass bg-white/5 border-white/20"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditContractModal(false)}
                  className="border-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateContract}
                  disabled={!newContractData.name.trim()}
                  className="bg-gradient-to-r from-gray-500 to-gray-700"
                >
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Seção */}
        <Dialog open={showEditSectionModal} onOpenChange={setShowEditSectionModal}>
          <DialogContent className="glass-strong border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Seção</DialogTitle>
              <DialogDescription>
                Edite a seção "{editingSection?.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-section-title">Título da Seção</Label>
                <Input
                  id="edit-section-title"
                  value={newSectionData.title}
                  onChange={(e) => setNewSectionData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="glass bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-section-description">Descrição Breve</Label>
                <Input
                  id="edit-section-description"
                  value={newSectionData.description}
                  onChange={(e) => setNewSectionData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="glass bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>Conteúdo da Seção</Label>
                <Editor
                  content={newSectionData.content}
                  onChange={(content) => setNewSectionData(prev => ({
                    ...prev,
                    content
                  }))}
                  tags={tags}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditSectionModal(false)}
                  className="border-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateSection}
                  disabled={!newSectionData.title.trim()}
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Importar Seção */}
        {showImportModal && selectedContract && (
          <ImportSectionModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            targetContract={selectedContract}
            onImportComplete={() => {
              if (selectedContract) {
                loadSections(selectedContract.id);
              }
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default DocumentsPage;
