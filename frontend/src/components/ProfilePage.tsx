
import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Lock, Building, Upload, Save, Loader2, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Company, UpdateProfileData } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateProfileData>({
    email: '',
    password: '',
    companyId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [companiesData] = await Promise.all([
        api.getCompanies(user.id)
      ]);
      
      setCompanies(companiesData);
      
      // Preencher formulário com dados do usuário
      setFormData({
        email: user.email,
        password: '',
        companyId: user.company?.id || ''
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de file
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Por favor, selecione uma imagem válida.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      const updatedUser = await api.updateProfile(formData);
      updateUser(updatedUser);
      
      // Limpar senha do formulário
      setFormData(prev => ({ ...prev, password: '' }));
      setAvatarPreview(null);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Meu Perfil</h1>
        <p className="text-gray-300 mt-2">Gerencie suas informações pessoais</p>
      </div>

      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="w-6 h-6" />
            <span>Informações Pessoais</span>
          </CardTitle>
          <CardDescription>
            Atualize seus dados pessoais e configurações de conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-purple-500 to-pink-500"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-400">Clique no ícone da câmera para alterar sua foto</p>
                <p className="text-xs text-gray-500 mt-1">Formatos aceitos: JPG, PNG (máx. 5MB)</p>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="glass bg-white/5 border-white/20 focus:border-purple-400"
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>New Password</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite uma nova senha (opcional)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="glass bg-white/5 border-white/20 focus:border-purple-400"
              />
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password}</p>
              )}
              <p className="text-xs text-gray-400">
                Deixe em branco para manter a senha atual
              </p>
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Empresa</span>
              </Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => handleInputChange('companyId', value)}
              >
                <SelectTrigger className="glass bg-white/5 border-white/20">
                  <SelectValue placeholder="Select aa empresa" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/20">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
              <Button
                type="button"
                variant="outline"
                onClick={loadData}
                className="border-white/20"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
