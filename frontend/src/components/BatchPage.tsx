
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

const BatchPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates', user?.id],
    queryFn: () => user ? api.getTemplates(user.id) : Promise.resolve({ templates: [] }),
    enabled: !!user
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelection(files);
  };

  const handleFileSelection = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O file deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: "Formato inválido",
        description: "Apenas files Excel (.xlsx, .xls) são aceitos.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    toast({
      title: "Arquivo selecionado",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
    });
  };

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplateIds(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleRemoveTemplate = (templateId: string) => {
    setSelectedTemplateIds(prev => prev.filter(id => id !== templateId));
  };

  const getSelectedTemplates = () => {
    if (!templatesData?.templates) return [];
    return templatesData.templates.filter(template => 
      selectedTemplateIds.includes(template.id)
    );
  };

  const handleSubmit = async () => {
    if (!selectedFile || selectedTemplateIds.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Select a file Excel e pelo menos um template.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      await api.processBatchTemplates(selectedTemplateIds, selectedFile);
      toast({
        title: "Processamento iniciado",
        description: "Os templates estão sendo gerados. O download será iniciado em breve."
      });
      
      // Reset form
      setSelectedFile(null);
      setSelectedTemplateIds([]);
    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o file. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Processamento em Lote</h1>
          <p className="text-muted-foreground">
            Gere múltiplos templates automaticamente através de uma planilha Excel. 
            Faça upload do file com os dados e selecione os modelos de template desejados.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5" />
                <span>Upload do Arquivo Excel</span>
              </CardTitle>
              <CardDescription>
                Faça upload de um file .xlsx ou .xls com os dados para gerar os templates (máximo 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : selectedFile
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-border/80'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-4">
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircle className="w-8 h-8" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">
                          Arraste e solte seu file Excel aqui
                        </p>
                        <p className="text-muted-foreground">
                          ou clique para selecionar
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Formatos aceitos: .xlsx, .xls (máximo 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Template</CardTitle>
              <CardDescription>
                Selecione os templates que serão usados como modelo para gerar os documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templatesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading templates...</span>
                </div>
              ) : (
                <>
                  {/* Selected Templates */}
                  {selectedTemplateIds.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Templates selecionados:</p>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedTemplates().map((template) => (
                          <Badge key={template.id} variant="secondary" className="flex items-center gap-1">
                            {template.name}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-destructive" 
                              onClick={() => handleRemoveTemplate(template.id)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Template Selector */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                      className="w-full justify-start"
                    >
                      {showTemplateSelector ? 'Ocultar templates' : 'Selecionar templates'}
                    </Button>

                    {showTemplateSelector && (
                      <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                        {templatesData?.templates.map((template) => (
                          <div
                            key={template.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedTemplateIds.includes(template.id)
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-muted border-border'
                            }`}
                            onClick={() => handleTemplateToggle(template.id)}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                selectedTemplateIds.includes(template.id)
                                  ? 'bg-primary border-primary'
                                  : 'border-border'
                              }`}>
                                {selectedTemplateIds.includes(template.id) && (
                                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{template.name}</p>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || selectedTemplateIds.length === 0 || isUploading}
              size="lg"
              className="px-8"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Gerar Templates em Lote
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">Como funciona:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Faça upload de uma planilha Excel com os dados dos templates</li>
                    <li>Selecione os modelos de template que serão usados</li>
                    <li>O sistema gerará um template para cada linha da planilha usando cada modelo selecionado</li>
                    <li>Todos os templates serão compactados em um file ZIP para download</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BatchPage;
