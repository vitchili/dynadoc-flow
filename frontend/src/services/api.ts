import { 
  User, 
  Template, 
  Section, 
  Tag, 
  Context,
  Company, 
  LoginCredentials, 
  CreateTemplateData, 
  CreateSectionData, 
  CreateTagData,
  CreateContextData,
  UpdateProfileData,
  TemplatesResponse,
  GeneratedFilesResponse
} from '@/types';

const BASE_URL = 'http://localhost:8000/api';

const api = {
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer login');
      }
      
      const apiResponse = await response.json();

      const user: User = {
        id: apiResponse.data.id,
        email: apiResponse.data.email,
        name: apiResponse.data.name,
        avatar: undefined,
      };
      
      return { user };

    } catch (error){
      console.log(error.message);
      throw new Error('Credenciais inválidas');
    }
  },

  async logout(): Promise<void> {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  async getUser(id: string) /*: Promise<User>*/ {
    // const response = await fetch(`${BASE_URL}/users/${id}`, {
    //   method: 'GET',
    //   credentials: 'include',
    //   headers: { 'Content-Type': 'application/json' },
    // });

    // if (!response.ok) {
    //   throw new Error('Erro ao buscar usuário');
    // }

    // return response.json();
  },

  async getTemplates(page = 1, limit = 10): Promise<TemplatesResponse> {
    try {
      const response = await fetch(`${BASE_URL}/templates/filters`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar templates');
      }
      
      const apiResponse = await response.json();
      const allTemplates = apiResponse.data.map((element: any) => ({
        id: element.id,
        name: element.name,
        description: element.description,
        sections: []
      }));
  
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const templates = allTemplates.slice(startIndex, endIndex);

      return {
        templates,
        total: allTemplates.length,
        page,
        totalPages: Math.ceil(allTemplates.length / limit)
      };

    } catch {
      throw new Error('Erro ao consultar templates');
    }
  },

  async filterTemplates(query: string, page = 1, limit = 10): Promise<TemplatesResponse> {
    try {
      const response = await fetch(`${BASE_URL}/templates/filters`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar templates');
      }
      
      const apiResponse = await response.json();
      const allTemplates = apiResponse.data.map((element: any) => ({
        id: element.id,
        name: element.name,
        description: element.description,
        sections: []
      }));

      const filteredTemplates = allTemplates.filter(template => 
        template.name.toLowerCase().includes(query.toLowerCase())
      );

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const templates = filteredTemplates.slice(startIndex, endIndex);

      return {
        templates,
        total: filteredTemplates.length,
        page,
        totalPages: Math.ceil(filteredTemplates.length / limit)
      };
    } catch {
      throw new Error('Erro ao consultar templates');
    }
  },

  async createTemplate(data: CreateTemplateData): Promise<string> {
    const response = await fetch(`${BASE_URL}/templates`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao cadastrar template');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data.id;
  },

  async updateTemplate(id: string, data: Partial<CreateTemplateData>): Promise<Template> {
    const response = await fetch(`${BASE_URL}/templates/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar template');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir template');
    }
  },

  async getSections(templateId: string): Promise<Section[]> {
    const response = await fetch(`${BASE_URL}/sections/filters?templateId=${templateId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar sections');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data.sort((a: any, b: any) => a.sectionOrder - b.sectionOrder);
  },

  async createSection(data: CreateSectionData): Promise<string> {
    const response = await fetch(`${BASE_URL}/sections`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao cadastrar seção');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data.id;
  },

  async updateSection(id: string, data: Partial<CreateSectionData>): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/sections/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar seção');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data;
  },

  async deleteSection(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/sections/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir seção');
    }
  },

  async getContexts(): Promise<Context[]> {
    const response = await fetch(`${BASE_URL}/contexts/filters`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar contexts');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data;
  },

  async createContext(data: CreateContextData): Promise<string> {
    const response = await fetch(`${BASE_URL}/contexts`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao cadastrar context');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data.id;
  },

  async updateContext(id: string, data: CreateContextData): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/contexts/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar context');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data;
  },

  async deleteContext(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/contexts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir context');
    }
  },

  async getTags(): Promise<Tag[]> {
    const response = await fetch(`${BASE_URL}/tags/filters`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar tags');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data;
  },

  async createTag(data: CreateTagData): Promise<string> {
    const response = await fetch(`${BASE_URL}/tags`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao cadastrar tag');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data.id;
  },

  async updateTag(id: string, data: CreateTagData): Promise<Tag> {
    const response = await fetch(`${BASE_URL}/tags/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar tag');
    }
    
    const apiResponse = await response.json();
    return apiResponse.data;
  },

  async deleteTag(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/tags/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir tag');
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar perfil');
    }

    return response.json();
  },

  async getGeneratedFiles(page = 1, limit = 10): Promise<GeneratedFilesResponse> {
    const response = await fetch(`${BASE_URL}/files/filters`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar arquivos');
    }
    
    const apiResponse = await response.json();
    const allFiles = apiResponse.data;
  
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const files = allFiles.slice(startIndex, endIndex);

    return {
      files,
      total: allFiles.length,
      page,
      totalPages: Math.ceil(allFiles.length / limit)
    };
  },

  async downloadGeneratedFile(fileId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/files/${fileId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Erro ao baixar arquivo');
    }
    
    await response.blob();
  }
};

export default api;
