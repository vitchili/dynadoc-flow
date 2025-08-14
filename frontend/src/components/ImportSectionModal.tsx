
import React, { useState, useEffect } from 'react';
import { Template, Section } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Search, Loader2, FileText } from 'lucide-react';

interface ImportSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTemplate: Template;
  onImportComplete: () => void;
}

const ImportSectionModal: React.FC<ImportSectionModalProps> = ({
  isOpen,
  onClose,
  targetTemplate,
  onImportComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadTemplates();
    }
  }, [isOpen, user]);

  const loadTemplates = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.getTemplates(1, 100); // Get all templates for selection
      const availableTemplates = response.templates.filter(c => c.id !== targetTemplate.id);
      setTemplates(availableTemplates);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates disponíveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (templateId: string) => {
    try {
      setSectionsLoading(true);
      const sectionsData = await api.getSections(templateId);
      setSections(sectionsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sections do template selecionado.",
        variant: "destructive",
      });
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);
    await loadSections(template.id);
  };

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const handleImport = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Atenção",
        description: "Select a template para importar as sections.",
      });
      return;
    }

    if (selectedSections.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos uma seção para importar.",
      });
      return;
    }

    try {
      setLoading(true);
      await api.importSections(targetTemplate.id, selectedSections);
      toast({
        title: "Sucesso",
        description: "Seções importadas com sucesso!",
      });
      onImportComplete();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível importar as sections.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setSections([]);
    setSelectedSections([]);
    onClose();
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-strong border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Seções</DialogTitle>
          <DialogDescription>
            Select a template e as sections que deseja importar para "{targetTemplate.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Templates */}
          <div>
            <Label htmlFor="search-templates">Search Templates</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                id="search-templates"
                placeholder="Digite o nome do template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass bg-white/5 border-white/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading templates...
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.length === 0 ? (
                <p className="text-gray-400">No template found.</p>
              ) : (
                filteredTemplates.map(template => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className={`w-full justify-start border-white/20 ${selectedTemplate?.id === template.id ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-white/5'}`}
                    onClick={() => handleTemplateSelect(template)}
                    disabled={loading}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {template.name}
                  </Button>
                ))
              )}
            </div>
          )}

          {/* Sections List */}
          {selectedTemplate && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Seções do Template</h3>
              {sectionsLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading sections...
                </div>
              ) : sections.length === 0 ? (
                <p className="text-gray-400">Nenhuma seção encontrada neste template.</p>
              ) : (
                sections.map(section => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`section-${section.id}`}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                      disabled={loading}
                    />
                    <Label htmlFor={`section-${section.id}`} className="text-sm">
                      {section.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={handleClose} className="border-white/20">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading} className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900">
            Importar Seções
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSectionModal;
