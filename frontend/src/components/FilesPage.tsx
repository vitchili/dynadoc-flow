import React, { useEffect, useState } from 'react';
import { Download, FileText, Calendar, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedFilesResponse } from '@/types';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FilesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filesData, setFilesData] = useState<GeneratedFilesResponse>({
    files: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadFiles();
  }, [user, currentPage]);

  const loadFiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.getGeneratedFiles(user.id, currentPage, 10);
      setFilesData(response);
    } catch (error) {
      toast({
        title: "Erro ao carregar arquivos",
        description: "Não foi possível carregar os arquivos gerados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      setDownloadingFiles(prev => new Set(prev).add(fileId));
      await api.downloadGeneratedFile(fileId);
      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-20">
          <div className="glass-card p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Carregando arquivos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Arquivos Gerados</h1>
        <p className="text-gray-300">Visualize e baixe todos os arquivos que foram gerados</p>
      </div>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Histórico de Arquivos
            </CardTitle>
            <CardDescription>
              Lista de todos os arquivos gerados a partir dos seus modelos de contrato
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filesData.files.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Nenhum arquivo encontrado</h3>
                <p className="text-gray-400">
                  Você ainda não gerou nenhum arquivo. Vá para a página de Lote para gerar seus primeiros arquivos.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 font-semibold">Nome do Modelo</th>
                      <th className="text-left py-3 px-4 font-semibold">Data de Geração</th>
                      <th className="text-right py-3 px-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filesData.files.map((file) => (
                      <tr key={file.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{file.templateName || 'Modelo não encontrado'}</p>
                              <p className="text-sm text-gray-400">ID: {file.templateId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(file.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(file.id)}
                            disabled={downloadingFiles.has(file.id)}
                            className="hover:bg-green-500/20"
                          >
                            {downloadingFiles.has(file.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginação */}
        {filesData.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: filesData.totalPages }, (_, i) => i + 1).map((page) => (
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
                    onClick={() => handlePageChange(Math.min(filesData.totalPages, currentPage + 1))}
                    className={currentPage === filesData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  };

export default FilesPage;