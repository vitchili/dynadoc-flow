
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
        description: "JSON Model copiado para a área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "It wasn't possible copy the text.",
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
              API Documentation
            </h1>
          </div>
          <p className="text-gray-300 text-lg mx-auto">
            Use this documentation to integrate template generation into your applications. Send data via JSON to generate multiple templates dynamically.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* API Endpoint Info */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>Generation Endpoint</span>
              </CardTitle>
              <CardDescription>
                Information about the endpoint to generate templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-green-400 font-mono text-sm">
                  POST /files/async-generate
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-300">Description:</h4>
                <p className="text-gray-300">
                  This endpoint receives an array of JSON objects, where each object represents the data to generate a template. The keys must match the registered tag names, and the values are the actual data that will replace the tags in the document.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* JSON Template */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-500" />
                <span>JSON Model</span>
              </CardTitle>
              <CardDescription>
                Model based on your registered tags
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
                    {copied ? 'Copiado!' : 'Copiar JSON Model'}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    No registered tag found. Register tags in the settings to generate the JSON model.
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
                <span>How to use</span>
              </CardTitle>
              <CardDescription>
                Instructions to use the API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Copy the JSON model</h4>
                    <p className="text-gray-400 text-sm">
                      Use the "Copy JSON Model" button to get the base structure.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Set the values</h4>
                    <p className="text-gray-400 text-sm">
                      Replace the empty double quotes with the actual values corresponding to each tag.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Make the request</h4>
                    <p className="text-gray-400 text-sm">
                      Make a POST request to /files/async-generate with the filled JSON array.
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
