
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Check, FileText, Code, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ApiPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: () => api.getTags(user?.id || ''),
    enabled: !!user?.id,
  });

  const generateJsonTemplate = () => {
    const template = tags.reduce((acc, tag) => {
      acc[tag.name] = "";
      return acc;
    }, {} as Record<string, string>);
    
    return [template]; // Return as array since endpoint expects array
  };

  const handleCopyJson = async () => {
    const jsonTemplate = generateJsonTemplate();
    const jsonString = JSON.stringify(jsonTemplate, null, 2);
    
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Modelo JSON copiado para a área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen from-purple-900 via-blue-900 to-indigo-900">
      <div className="">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-2">
            <Code className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">
              Documentação da API
            </h1>
          </div>
          <p className="text-gray-300 text-lg mx-auto">
            Utilize esta documentação para integrar a geração de templates em suas aplicações.
            Envie os dados via JSON para gerar múltiplos templates dinamicamente.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* API Endpoint Info */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>Endpoint de Geração</span>
              </CardTitle>
              <CardDescription>
                Informações sobre o endpoint para gerar templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-green-400 font-mono text-sm">
                  POST /templates/generate
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-300">Descrição:</h4>
                <p className="text-gray-300">
                  Este endpoint recebe um array de objetos JSON, onde cada objeto representa os dados
                  para gerar um template. As chaves devem corresponder aos nomes das tags cadastradas,
                  e os valores são os dados reais que substituirão as tags no documento.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* JSON Template */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-500" />
                <span>Modelo JSON</span>
              </CardTitle>
              <CardDescription>
                Modelo baseado nas suas tags cadastradas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : tags.length > 0 ? (
                <>
                  <div className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">
                      {JSON.stringify(generateJsonTemplate(), null, 2)}
                    </pre>
                  </div>
                  <Button
                    onClick={handleCopyJson}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? 'Copiado!' : 'Copiar Modelo JSON'}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Nenhuma tag cadastrada encontrada. 
                    Cadastre tags nas configurações para gerar o modelo JSON.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>Como Usar</span>
              </CardTitle>
              <CardDescription>
                Instruções para utilizar a API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Copie o modelo JSON</h4>
                    <p className="text-gray-400 text-sm">
                      Use o botão "Copiar Modelo JSON" para obter a estrutura base.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Preencha os valores</h4>
                    <p className="text-gray-400 text-sm">
                      Substitua as aspas duplas vazias pelos valores reais correspondentes a cada tag.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Envie a requisição</h4>
                    <p className="text-gray-400 text-sm">
                      Faça uma requisição POST para /templates/generate com o array JSON preenchido.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiPage;
