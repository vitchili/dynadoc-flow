import React, { useEffect, useState, useCallback } from 'react';
import { Plus, FileText, Calendar, ChevronDown, ChevronUp, Edit, Trash2, Upload, Loader2, Search, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Template, Section, Tag, CreateTemplateData, CreateSectionData, TemplatesResponse } from '@/types';
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
  const [templatesData, setTemplatesData] = useState<TemplatesResponse>({
    templates: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form states
  const [newTemplateData, setNewTemplateData] = useState<CreateTemplateData>({
    name: '',
    description: ''
  });
  const [newSectionData, setNewSectionData] = useState<CreateSectionData>({
    name: '',
    description: '',
    htmlContent: '',
    templateId: ''
  });

  useEffect(() => {
    loadTemplates();
    loadTags();
  }, [user, currentPage, searchQuery]);

  const loadTemplates = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let response: TemplatesResponse;
      
      if (searchQuery.trim()) {
        response = await api.filterTemplates(searchQuery, currentPage, 10);
      } else {
        response = await api.getTemplates(currentPage, 10);
      }
      
      setTemplatesData(response);
    } catch (error) {
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar seus templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    if (!user) return;
    
    try {
      const tagsData = await api.getTags();
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadSections = async (templateId: string) => {
    try {
      setSectionsLoading(true);
      const sectionsData = await api.getSections(templateId);
      setSections(sectionsData);
    } catch (error) {
      toast({
        title: "Erro ao carregar seções",
        description: "Não foi possível carregar as seções do template.",
        variant: "destructive",
      });
    } finally {
      setSectionsLoading(false);
    }
  };

  const moveSection = useCallback(async (dragIndex: number, hoverIndex: number) => {
    if (!selectedTemplate) return;

    const dragSection = sections[dragIndex];
    const hoverSection = sections[hoverIndex];
    
    // Reorder sections array locally for immediate UI feedback
    const newSections = [...sections];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, dragSection);
    
    // Update order property based on new positions
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      sectionOrder: index + 1
    }));
    
    setSections(updatedSections);

    try {
      // Update order in backend
      await api.updateSectionOrder(selectedTemplate.id, updatedSections.map(s => ({ id: s.id, sectionOrder: s.sectionOrder })));
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
  }, [sections, selectedTemplate, toast]);

  const handleTemplateClick = async (template: Template) => {
    setSelectedTemplate(template);
    
    if (expandedTemplates.has(template.id)) {
      setExpandedTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
      setSections([]);
    } else {
      setExpandedTemplates(prev => new Set([...prev, template.id]));
      await loadSections(template.id);
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

  const handleCreateTemplate = async () => {
    if (!user || !newTemplateData.name.trim()) return;

    try {
      const template = await api.createTemplate(newTemplateData);
      await loadTemplates();
      setNewTemplateData({ name: '', description: '' });
      setShowNewTemplateModal(false);
      toast({
        title: "Template criado!",
        description: "Seu novo template foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar template",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplateData({
      name: template.name,
      description: template.description
    });
    setShowEditTemplateModal(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const updatedTemplate = await api.updateTemplate(editingTemplate.id, newTemplateData);
      await loadTemplates();
      setEditingTemplate(null);
      setNewTemplateData({ name: '', description: '' });
      setShowEditTemplateModal(false);
      toast({
        title: "Template atualizado!",
        description: "O template foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar template",
        description: "Não foi possível atualizar o template.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSection = async () => {
    if (!selectedTemplate || !newSectionData.name.trim()) return;

    try {
      const sectionData = {
        ...newSectionData,
        templateId: selectedTemplate.id
      };
      await api.createSection(sectionData);
      const updatedSections = await api.getSections(sectionData.templateId);
      setSections(updatedSections);
      setNewSectionData({ name: '', description: '', htmlContent: '', templateId: '' });
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
      name: section.name,
      description: section.description,
      htmlContent: section.htmlContent,
      templateId: section.templateId
    });
    setShowEditSectionModal(true);
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;

    try {
      await api.updateSection(editingSection.id, newSectionData);
      const updatedSections = await api.getSections(newSectionData.templateId);
      setSections(updatedSections);
      setEditingSection(null);
      setNewSectionData({ name: '', description: '', htmlContent: '', templateId: '' });
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

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    try {
      await api.deleteTemplate(templateId);
      await loadTemplates();
      toast({
        title: "Template excluído!",
        description: "O template e suas seções foram excluídos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir template",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExample = async (templateId: string) => {
    try {
      await api.downloadTemplateExample(templateId);
      toast({
        title: "Download iniciado!",
        description: "O download do modelo será processado.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o modelo do template.",
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
            <h1 className="text-3xl font-bold gradient-text">Meus Templates</h1>
            <p className="text-gray-300 mt-2">Gerencie seus templates e seções</p>
          </div>
          
          <Dialog open={showNewTemplateModal} onOpenChange={setShowNewTemplateModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-white/20">
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Nome do Template</Label>
                  <Input
                    id="template-name"
                    placeholder="Ex: Template de Prestação de Serviços"
                    value={newTemplateData.name}
                    onChange={(e) => setNewTemplateData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="glass bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Descrição</Label>
                  <Textarea
                    id="template-description"
                    placeholder="Descreva o propósito deste template..."
                    value={newTemplateData.description}
                    onChange={(e) => setNewTemplateData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="glass bg-white/5 border-white/20"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewTemplateModal(false)}
                    className="border-white/20"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateTemplate}
                    disabled={!newTemplateData.name.trim()}
                    className="bg-gradient-to-r from-gray-500 to-gray-700"
                  >
                    Criar Template
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
              placeholder="Pesquisar templates..."
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

        {templatesData.templates.length === 0 ? (
          <Card className="glass-card border-white/20 text-center py-12">
            <CardHeader>
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <CardTitle>Nenhum template encontrado</CardTitle>
              <CardDescription>
                {searchQuery ? 'Nenhum template corresponde à sua pesquisa' : 'Crie seu primeiro template para começar a organizar seus documentos'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {templatesData.templates.map((template) => (
                <Card key={template.id} className="glass-card border-white/20">
                  <Collapsible
                    open={expandedTemplates.has(template.id)}
                    onOpenChange={() => handleTemplateClick(template)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-gray-400" />
                            <div>
                              <CardTitle className="text-left">{template.name}</CardTitle>
                              <CardDescription className="text-left mt-1">
                                {template.description}
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
                                  handleDownloadExample(template.id);
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
                                  handleEditTemplate(template);
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
                                      Tem certeza que deseja excluir o template "{template.name}" e todas as suas seções? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-white/20">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            {expandedTemplates.has(template.id) ? (
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
                            <h3 className="text-lg font-semibold">Seções do Template</h3>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTemplate(template);
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
                                  setSelectedTemplate(template);
                                  setNewSectionData({ name: '', description: '', htmlContent: '', templateId: template.id });
                                  setShowNewSectionModal(true);
                                }}
                                className="bg-gradient-to-r from-gray-500 to-gray-700"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Seção
                              </Button>
                            </div>
                          </div>

                          {sectionsLoading && selectedTemplate?.id === template.id ? (
                            <div className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                              <p className="text-gray-400">Carregando seções...</p>
                            </div>
                          ) : sections.length === 0 && selectedTemplate?.id === template.id ? (
                            <div className="text-center py-8 text-gray-400">
                              <p>Nenhuma seção criada ainda</p>
                            </div>
                          ) : (
                            selectedTemplate?.id === template.id && (
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
            {templatesData.totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: templatesData.totalPages }, (_, i) => i + 1).map((page) => (
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
                      onClick={() => handlePageChange(Math.min(templatesData.totalPages, currentPage + 1))}
                      className={currentPage === templatesData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                Adicione uma nova seção ao template "{selectedTemplate?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section-title">Título da Seção</Label>
                <Input
                  id="section-title"
                  placeholder="Ex: Cláusulas Gerais"
                  value={newSectionData.name}
                  onChange={(e) => setNewSectionData(prev => ({
                    ...prev,
                    name: e.target.value
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
                  htmlContent={newSectionData.htmlContent}
                  onChange={(htmlContent) => setNewSectionData(prev => ({
                    ...prev,
                    htmlContent
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
                  disabled={!newSectionData.name.trim()}
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                >
                  Criar Seção
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Template */}
        <Dialog open={showEditTemplateModal} onOpenChange={setShowEditTemplateModal}>
          <DialogContent className="glass-strong border-white/20">
            <DialogHeader>
              <DialogTitle>Editar Template</DialogTitle>
              <DialogDescription>
                Edite as informações do template "{editingTemplate?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-template-name">Nome do Template</Label>
                <Input
                  id="edit-template-name"
                  placeholder="Ex: Template de Prestação de Serviços"
                  value={newTemplateData.name}
                  onChange={(e) => setNewTemplateData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="glass bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-template-description">Descrição</Label>
                <Textarea
                  id="edit-template-description"
                  placeholder="Descreva o propósito deste template..."
                  value={newTemplateData.description}
                  onChange={(e) => setNewTemplateData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="glass bg-white/5 border-white/20"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditTemplateModal(false)}
                  className="border-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateTemplate}
                  disabled={!newTemplateData.name.trim()}
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
                Edite a seção "{editingSection?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-section-title">Título da Seção</Label>
                <Input
                  id="edit-section-title"
                  value={newSectionData.name}
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
                  htmlContent={newSectionData.htmlContent}
                  onChange={(htmlContent) => setNewSectionData(prev => ({
                    ...prev,
                    htmlContent
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
                  disabled={!newSectionData.name.trim()}
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Importar Seção */}
        {showImportModal && selectedTemplate && (
          <ImportSectionModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            targetTemplate={selectedTemplate}
            onImportComplete={() => {
              if (selectedTemplate) {
                loadSections(selectedTemplate.id);
              }
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default DocumentsPage;
