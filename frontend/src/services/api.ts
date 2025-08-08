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
  GeneratedFile,
  GeneratedFilesResponse
} from '@/types';

const BASE_URL = 'http://localhost:8000/api/';

let authToken: string | null = localStorage.getItem('authToken');

const api = {
  setAuthToken: (token: string | null) => {
    authToken = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  },

  getAuthToken: () => authToken,

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer login');
      }
      
      const apiResponse = await response.json();
      const token = apiResponse.data.token

      const user: User = {
        id: apiResponse.data.id,
        email: apiResponse.data.email,
        name: apiResponse.data.name,
        avatar: undefined,
      };
      
      this.setAuthToken(apiResponse.data.token);
      return { user, token };

    } catch (error) {
      throw new Error('Credenciais inválidas');
    }
  },

  async logout(): Promise<void> {
    console.log('API: Logout');
    this.setAuthToken(null);
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async getUser(id: string): Promise<User> {
    console.log('API: Get user', id);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
    };
  },

  async getTemplates(page: number = 1, limit: number = 10): Promise<TemplatesResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try{
      const response = await fetch(`${BASE_URL}/templates/filters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar templates');
      }
      
      const apiResponse = await response.json();

      var allTemplates = []

      apiResponse.data.forEach(element => {
        allTemplates.push({
          id: element.id,
          name: element.name,
          description: element.description,
          sections: []
        })
      });
  
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const templates = allTemplates.slice(startIndex, endIndex);

      return {
        templates,
        total: allTemplates.length,
        page,
        totalPages: Math.ceil(allTemplates.length / limit)
      };

    } catch (error) {
      throw new Error('Erro ao consultar templates');
    }
  },

  async filterTemplates(query: string, page: number = 1, limit: number = 10): Promise<TemplatesResponse> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try{
      const response = await fetch(`${BASE_URL}/templates/filters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar templates');
      }
      
      const apiResponse = await response.json();

      var allTemplates = []

      apiResponse.data.forEach(element => {
        allTemplates.push({
          id: element.id,
          name: element.name,
          description: element.description,
          sections: []
        })
      });

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
    } catch (error) {
      throw new Error('Erro ao consultar templates');
    }
  },

  async createTemplate(data: CreateTemplateData): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try{
      const response = await fetch(`${BASE_URL}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar template');
      }
      
      const apiResponse = await response.json();

      return apiResponse.data.id
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateTemplate(id: string, data: Partial<CreateTemplateData>): Promise<Template> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(data);
    try{
      const response = await fetch(`${BASE_URL}/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar template');
      }
      
      const apiResponse = await response.json();

      return apiResponse.data
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));

    try{
      const response = await fetch(`${BASE_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir templates');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async downloadTemplateExample(id: string): Promise<void> {
    console.log('API: Download template example', id);
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  async getSections(templateId: string): Promise<Section[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try{
      const response = await fetch(`${BASE_URL}/sections/filters?templateId=${templateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar seções');
      }
      
      const apiResponse = await response.json();

      var data = []

      apiResponse.data.forEach(element => {
        data.push({
          id: element.id,
          name: element.name,
          description: element.description,
          templateId: element.templateId,
          htmlContent: element.htmlContent,
          sectionOrder: element.sectionOrder
        })
      });

      data.sort((a, b) => a.sectionOrder - b.sectionOrder);
  
      return data

    } catch (error) {
      throw new Error('Erro ao consultar contextos');
    }
  },

  async createSection(data: CreateSectionData): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try{
      const response = await fetch(`${BASE_URL}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar seção');
      }
      
      const apiResponse = await response.json();

      return apiResponse.data.id
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateSection(id: string, data: Partial<CreateSectionData>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try{
      const response = await fetch(`${BASE_URL}/sections/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar seção');
      }
      
      const apiResponse = await response.json();

      return apiResponse.data
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateSectionOrder(templateId: string, sectionOrders: { id: string; sectionOrder: number }[]): Promise<void> {
    console.log('API: Update section order', templateId, sectionOrders);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate API call to update section orders
  },

  async deleteSection(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    try{
      const response = await fetch(`${BASE_URL}/sections/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir seção');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Contexts CRUD API
  async getContexts(): Promise<Context[]> {
    try{
      const response = await fetch(`${BASE_URL}/contexts/filters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar contextos');
      }
      
      const apiResponse = await response.json();

      var data = []

      apiResponse.data.forEach(element => {
        data.push({
          id: element.id,
          name: element.name,
          description: element.description
        })
      });
  
      return data

    } catch (error) {
      throw new Error('Erro ao consultar contextos');
    }
    
  },

  async createContext(data: CreateContextData): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600));

    try{
      const response = await fetch(`${BASE_URL}/contexts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar contexto');
      }
      
      const apiResponse = await response.json();

      return apiResponse.data.id
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateContext(id: string, data: CreateContextData): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 600));

    try{
      const response = await fetch(`${BASE_URL}/contexts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar contexto');
      }
      
      const apiResponse = await response.json();

      return apiResponse.data
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async deleteContext(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    try{
      const response = await fetch(`${BASE_URL}/contexts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir contexto');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Tags API with Context
  async getTags(): Promise<Tag[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
     try{
      const response = await fetch(`${BASE_URL}/tags/filters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar tags');
      }
      
      const apiResponse = await response.json();

      var data = []

      apiResponse.data.forEach(element => {
        data.push({
          id: element.id,
          name: element.name,
          type: element.typeName,
          description: element.description,
          contextId: element.contextId,
          context: {
            id: element.context.id,
            name: element.context.name,
            description: element.context.description,
          }
        })
      });
  
      return data

    } catch (error) {
      throw new Error('Erro ao consultar contextos');
    }
  },

  async createTag(data: CreateTagData): Promise<string> {
    try{
      const response = await fetch(`${BASE_URL}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar tag');
      }
      
      const apiResponse = await response.json();

      return apiResponse.data.id

    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateTag(id: string, data: CreateTagData): Promise<Tag> {
    await new Promise(resolve => setTimeout(resolve, 600));

    try{
      const response = await fetch(`${BASE_URL}/tags/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar tag');
      }
      
      const apiResponse = await response.json();

      return apiResponse.data.id

    } catch (error) {
      throw new Error(error.message);
    }
  },

  async deleteTag(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    try{
      const response = await fetch(`${BASE_URL}/tags/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir tag');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getCompanies(userId: string): Promise<Company[]> {
    console.log('API: Get companies for user', userId);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      { id: '1', name: 'Empresa Exemplo' },
      { id: '2', name: 'Outra Empresa LTDA' }
    ];
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    console.log('API: Update profile', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: '1',
      email: data.email || 'admin@example.com',
      name: 'Admin User',
    };
  },

  async importSections(templateId: string, sectionIds: string[]): Promise<void> {
    console.log('API: Import sections', templateId, sectionIds);
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  async processBatchTemplates(templateIds: string[], file: File): Promise<void> {
    console.log('API: Process batch templates', templateIds, file.name);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate file processing and ZIP download
    const link = document.createElement('a');
    link.href = 'data:application/zip;base64,UEsDBAoAAAAAAIdYZ1QAAAAAAAAAAAAAAAAJAAAAbXlmaWxlLnR4dFBLAQIUAAoAAAAAAIdYZ1QAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAABteWZpbGUudHh0UEsFBgAAAAABAAEANwAAAB8AAAAAAA==';
    link.download = `templates_lote_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async getGeneratedFiles(page: number = 1, limit: number = 10): Promise<GeneratedFilesResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try{
      const response = await fetch(`${BASE_URL}/files/filters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar arquivos');
      }
      
      const apiResponse = await response.json();

      var allFiles = []

      apiResponse.data.forEach(element => {
        allFiles.push({
          id: element.id,
          templateId: element.templateId,
          userId: element.userId,
          createdAt: element.createdAt,
          templateName: element.templateName,
        })
      });
  
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const files = allFiles.slice(startIndex, endIndex);

    return {
      files,
      total: allFiles.length,
      page,
      totalPages: Math.ceil(allFiles.length / limit)
    };

    } catch (error) {
      throw new Error('Erro ao consultar contextos');
    }
  },

  async downloadGeneratedFile(fileId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try{
      const response = await fetch(`${BASE_URL}/files/${fileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao baixar arquivo');
      }
      
      await response.json();

    } catch (error) {
      throw new Error('Erro ao baixar arquivo');
    }
  }
};

export default api;
