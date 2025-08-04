
import React, { useState, useEffect } from 'react';
import { Contract, Section } from '@/types';
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
  targetContract: Contract;
  onImportComplete: () => void;
}

const ImportSectionModal: React.FC<ImportSectionModalProps> = ({
  isOpen,
  onClose,
  targetContract,
  onImportComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadContracts();
    }
  }, [isOpen, user]);

  const loadContracts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.getContracts(user.id, 1, 100); // Get all contracts for selection
      const availableContracts = response.contracts.filter(c => c.id !== targetContract.id);
      setContracts(availableContracts);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contratos disponíveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (contractId: string) => {
    try {
      setSectionsLoading(true);
      const sectionsData = await api.getSections(contractId);
      setSections(sectionsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as seções do contrato selecionado.",
        variant: "destructive",
      });
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleContractSelect = async (contract: Contract) => {
    setSelectedContract(contract);
    await loadSections(contract.id);
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
    if (!selectedContract) {
      toast({
        title: "Atenção",
        description: "Selecione um contrato para importar as seções.",
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
      await api.importSections(targetContract.id, selectedSections);
      toast({
        title: "Sucesso",
        description: "Seções importadas com sucesso!",
      });
      onImportComplete();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível importar as seções.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedContract(null);
    setSections([]);
    setSelectedSections([]);
    onClose();
  };

  const filteredContracts = contracts.filter(contract =>
    contract.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-strong border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Seções</DialogTitle>
          <DialogDescription>
            Selecione um contrato e as seções que deseja importar para "{targetContract.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Contracts */}
          <div>
            <Label htmlFor="search-contracts">Pesquisar Contratos</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                id="search-contracts"
                placeholder="Digite o nome do contrato..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass bg-white/5 border-white/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Carregando contratos...
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContracts.length === 0 ? (
                <p className="text-gray-400">Nenhum contrato encontrado.</p>
              ) : (
                filteredContracts.map(contract => (
                  <Button
                    key={contract.id}
                    variant="outline"
                    className={`w-full justify-start border-white/20 ${selectedContract?.id === contract.id ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-white/5'}`}
                    onClick={() => handleContractSelect(contract)}
                    disabled={loading}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {contract.name}
                  </Button>
                ))
              )}
            </div>
          )}

          {/* Sections List */}
          {selectedContract && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Seções do Contrato</h3>
              {sectionsLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Carregando seções...
                </div>
              ) : sections.length === 0 ? (
                <p className="text-gray-400">Nenhuma seção encontrada neste contrato.</p>
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
                      {section.title}
                    </Label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={handleClose} className="border-white/20">
            Cancelar
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
