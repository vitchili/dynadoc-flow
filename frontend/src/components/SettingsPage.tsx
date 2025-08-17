import React, { useEffect, useState } from 'react';
import { Plus, Tag as TagIcon, Edit, Trash2, Save, Loader2, FolderOpen, Folder } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tag, Context, CreateTagData, CreateContextData } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states for tags
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [showEditTagModal, setShowEditTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Modal states for contexts
  const [showNewContextModal, setShowNewContextModal] = useState(false);
  const [showEditContextModal, setShowEditContextModal] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);

  // Form state for tags
  const [newTagData, setNewTagData] = useState<CreateTagData>({
    name: '',
    type: '1',
    description: '',
    contextId: '',
    options: []
  });

  // Form state for contexts
  const [newContextData, setNewContextData] = useState<CreateContextData>({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [tagsData, contextsData] = await Promise.all([
        api.getTags(),
        api.getContexts()
      ]);
      setTags(tagsData);
      setContexts(contextsData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as tags e contexts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetTagForm = () => {
    setNewTagData({
      name: '',
      type: '1',
      description: '',
      contextId: '',
      options: []
    });
    setEditingTag(null);
  };

  const resetContextForm = () => {
    setNewContextData({
      name: '',
      description: ''
    });
    setEditingContext(null);
  };

  const handleCreateTag = async () => {
    if (!user || !newTagData.name.trim() || !newTagData.contextId) return;

    try {
      setSaving(true);
      await api.createTag({
        ...newTagData,
        name: newTagData.name.toUpperCase().replace(/\s+/g, '_')
      });
      const updatedTags = await api.getTags();
      setTags(updatedTags);
      resetTagForm();
      setShowNewTagModal(false);
      toast({
        title: "Tag created!",
        description: "The new tag was created with success.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "It wasn't possible to create the tag.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setNewTagData({
      name: tag.name,
      type: tag.type,
      description: tag.description,
      contextId: tag.contextId,
      options: tag.options || []
    });
    setShowEditTagModal(true);
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;

    try {
      setSaving(true);
      await api.updateTag(editingTag.id, newTagData);
      const updatedTag = await api.getTags();
      setTags(updatedTag);
      resetTagForm();
      setShowEditTagModal(false);
      toast({
        title: "Tag atualizada!",
        description: "A tag foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar tag",
        description: "Não foi possível atualizar a tag.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {

    try {
      await api.deleteTag(tagId);
      setTags(prev => prev.filter(t => t.id !== tagId));
      toast({
        title: "Tag excluída!",
        description: "A tag foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir tag",
        description: "Não foi possível excluir a tag.",
        variant: "destructive",
      });
    }
  };

  // Context management functions
  const handleCreateContext = async () => {
    if (!user || !newContextData.name.trim()) return;

    try {
      setSaving(true);
      await api.createContext(newContextData);
      const updatedContext = await api.getContexts();
      setContexts(updatedContext);
      resetContextForm();
      setShowNewContextModal(false);
      toast({
        title: "Context created!",
        description: "The new context was created with success.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "It wasn't possible to create the context.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditContext = (context: Context) => {
    setEditingContext(context);
    setNewContextData({
      name: context.name,
      description: context.description || ''
    });
    setShowEditContextModal(true);
  };

  const handleUpdateContext = async () => {
    if (!editingContext) return;

    try {
      setSaving(true);
      const updatedContext = await api.updateContext(editingContext.id, newContextData);
      setContexts(prev => prev.map(c => c.id === editingContext.id ? updatedContext : c));
      resetContextForm();
      setShowEditContextModal(false);
      toast({
        title: "Context atualizado!",
        description: "O context foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar context",
        description: "Não foi possível atualizar o context.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContext = async (contextId: string) => {

    try {
      await api.deleteContext(contextId);
      setContexts(prev => prev.filter(c => c.id !== contextId));
      setTags(prev => prev.filter(t => t.contextId !== contextId));
      toast({
        title: "Context excluído!",
        description: "O context e suas tags foram excluídos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir context",
        description: "Não foi possível excluir o context.",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '1': return 'bg-blue-500/20 text-blue-300';
      case '2': return 'bg-green-500/20 text-green-300';
      case '3': return 'text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case '1': return 'Text';
      case '2': return 'Number';
      case '3': return 'Data';
      default: return type;
    }
  };

  // Group tags by context
  const tagsByContext = tags.reduce((acc, tag) => {
    const contextName = tag.context?.name || 'Sem Context';
    if (!acc[contextName]) {
      acc[contextName] = [];
    }
    acc[contextName].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-gray-300 mt-2">Manage your dynamic tags and contexts</p>
      </div>

      <Tabs defaultValue="tags" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card border-white/20">
          <TabsTrigger value="tags" className="data-[state=active]:bg-white/20">
            <TagIcon className="w-4 h-4 mr-2" />
            Manage Tags
          </TabsTrigger>
          <TabsTrigger value="contexts" className="data-[state=active]:bg-white/20">
            <FolderOpen className="w-4 h-4 mr-2" />
            Manage Contexts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-200">Dynamic Tags</h2>
              <p className="text-gray-400">Manage your tags organized by context</p>
            </div>
            
            <Dialog open={showNewTagModal} onOpenChange={setShowNewTagModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900">
                  <Plus className="w-4 h-4 mr-2" />
                  New Tag
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border-white/20">
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                  <DialogDescription>
                    Crie uma nova tag dinâmica para usar em seus templates
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tag-context">Context</Label>
                    <Select
                      value={newTagData.contextId}
                      onValueChange={(value) => setNewTagData(prev => ({ ...prev, contextId: value }))}
                    >
                      <SelectTrigger className="glass bg-white/5 border-white/20">
                        <SelectValue placeholder="Select a context" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-white/20">
                        {contexts.map((context) => (
                          <SelectItem key={context.id} value={context.id}>
                            {context.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tag-name">Tag Name</Label>
                    <Input
                      id="tag-name"
                      placeholder="Ex: Full name"
                      value={newTagData.name}
                      onChange={(e) => setNewTagData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="glass bg-white/5 border-white/20"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      The name will be converted to uppercase and spaces will be replaced by underscores
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="tag-type">Field Type</Label>
                    <Select
                      value={newTagData.type}
                      onValueChange={(value: '1' | '2' | '3') => 
                        setNewTagData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="glass bg-white/5 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-white/20">
                        <SelectItem value="1">Text</SelectItem>
                        <SelectItem value="2">Number</SelectItem>
                        <SelectItem value="3">Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tag-description">Description</Label>
                    <Textarea
                      id="tag-description"
                      placeholder="Describe the purpose of this tag..."
                      value={newTagData.description}
                      onChange={(e) => setNewTagData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      className="glass bg-white/5 border-white/20"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetTagForm();
                        setShowNewTagModal(false);
                      }}
                      className="border-white/20"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTag}
                      disabled={!newTagData.name.trim() || !newTagData.contextId || !newTagData.type || !newTagData.description || saving}
                      className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Create Tag'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {tags.length === 0 ? (
            <Card className="glass-card border-white/20 text-center py-12">
              <CardHeader>
                <TagIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <CardTitle>No tag created</CardTitle>
                <CardDescription>
                  Create your first dynamic tag to personalize your templates.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(tagsByContext).map(([contextName, contextTags]) => (
                <div key={contextName} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200 border-b border-white/20 pb-2">
                    {contextName}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {contextTags.map((tag) => (
                      <Card key={tag.id} className="glass-card border-white/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge className={`${getTypeColor(tag.type)} border-0`}>
                              {tag.typeName}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTag(tag)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4 -mt-2"/>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass-strong border-white/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm exclusion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to exclude a tag "{tag.name}"? This can't be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-white/20">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTag(tag.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <CardTitle className="text-sm">#{tag.name}#</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-gray-300 mb-2">{tag.description}</p>
                          {tag.options && tag.options.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Opções:</p>
                              <div className="flex flex-wrap gap-1">
                                {tag.options.slice(0, 2).map((option, index) => (
                                  <Badge key={index} variant="outline" className="text-xs border-white/20">
                                    {option}
                                  </Badge>
                                ))}
                                {tag.options.length > 2 && (
                                  <Badge variant="outline" className="text-xs border-white/20">
                                    +{tag.options.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Edit Tag */}
          <Dialog open={showEditTagModal} onOpenChange={setShowEditTagModal}>
            <DialogContent className="glass-strong border-white/20">
              <DialogHeader>
                <DialogTitle>Edit Tag</DialogTitle>
                <DialogDescription>
                  Edite as informações da tag "{editingTag?.name}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-tag-context">Context</Label>
                  <Select
                    value={newTagData.contextId}
                    onValueChange={(value) => setNewTagData(prev => ({ ...prev, contextId: value }))}
                  >
                    <SelectTrigger className="glass bg-white/5 border-white/20">
                      <SelectValue placeholder="Select a context" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/20">
                      {contexts.map((context) => (
                        <SelectItem key={context.id} value={context.id}>
                          {context.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-tag-name">Tag Name</Label>
                  <Input
                    id="edit-tag-name"
                    value={newTagData.name}
                    onChange={(e) => setNewTagData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="glass bg-white/5 border-white/20"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-tag-type">Field Type</Label>
                  <Select
                    value='1'
                    onValueChange={(value: "1" | "2" | "3") => 
                      setNewTagData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="glass bg-white/5 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/20">
                      <SelectItem value="1">Text</SelectItem>
                      <SelectItem value="2">Number</SelectItem>
                      <SelectItem value="3">Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-tag-description">Description</Label>
                  <Textarea
                    id="edit-tag-description"
                    value={newTagData.description}
                    onChange={(e) => setNewTagData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="glass bg-white/5 border-white/20"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetTagForm();
                      setShowEditTagModal(false);
                    }}
                    className="border-white/20"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateTag}
                    disabled={!newTagData.name.trim() || !newTagData.contextId || !newTagData.type || !newTagData.description || saving}
                    className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="contexts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-200">Contexts</h2>
              <p className="text-gray-400">Organize your tags into contexts to make management easier</p>
            </div>
            
            <Dialog open={showNewContextModal} onOpenChange={setShowNewContextModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900">
                  <Plus className="w-4 h-4 mr-2" />
                  New Context
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border-white/20">
                <DialogHeader>
                  <DialogTitle>Create new Context</DialogTitle>
                  <DialogDescription>
                    Create a new context to organize your tags
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="context-name">Context name</Label>
                    <Input
                      id="context-name"
                      placeholder="Ex: Dados Cadastrais"
                      value={newContextData.name}
                      onChange={(e) => setNewContextData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="glass bg-white/5 border-white/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="context-description">Description</Label>
                    <Textarea
                      id="context-description"
                      placeholder="Describe the purpose of this context..."
                      value={newContextData.description}
                      onChange={(e) => setNewContextData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      className="glass bg-white/5 border-white/20"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetContextForm();
                        setShowNewContextModal(false);
                      }}
                      className="border-white/20"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateContext}
                      disabled={!newContextData.name.trim() || saving}
                      className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Create Context'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {contexts.length === 0 ? (
            <Card className="glass-card border-white/20 text-center py-12">
              <CardHeader>
                <Folder className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <CardTitle>No context created</CardTitle>
                <CardDescription>
                  Create your first context to organize your tags
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contexts.map((context) => {
                const contextTagCount = tags.filter(tag => tag.contextId === context.id).length;
                return (
                  <Card key={context.id} className="glass-card border-white/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="w-5 h-5 text-blue-400" />
                          <CardTitle className="text-lg">{context.name}</CardTitle>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContext(context)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-strong border-white/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm exclusion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to exclude o context "{context.name}"? This can't be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-white/20">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteContext(context.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <CardDescription className="text-gray-300">
                        {context.description || 'Sem descrição'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-white/20">
                          {contextTagCount} tag{contextTagCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Modal Edit Context */}
          <Dialog open={showEditContextModal} onOpenChange={setShowEditContextModal}>
            <DialogContent className="glass-strong border-white/20">
              <DialogHeader>
                <DialogTitle>Edit Context</DialogTitle>
                <DialogDescription>
                  Edite as informações do context "{editingContext?.name}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-context-name">Context name</Label>
                  <Input
                    id="edit-context-name"
                    value={newContextData.name}
                    onChange={(e) => setNewContextData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="glass bg-white/5 border-white/20"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-context-description">Description</Label>
                  <Textarea
                    id="edit-context-description"
                    value={newContextData.description}
                    onChange={(e) => setNewContextData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="glass bg-white/5 border-white/20"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetContextForm();
                      setShowEditContextModal(false);
                    }}
                    className="border-white/20"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateContext}
                    disabled={!newContextData.name.trim() || saving}
                    className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
