import { 
  User, 
  Contract, 
  Section, 
  Tag, 
  Context,
  Company, 
  LoginCredentials, 
  CreateContractData, 
  CreateSectionData, 
  CreateTagData,
  CreateContextData,
  UpdateProfileData,
  ContractsResponse,
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

  async getContracts(userId: string, page: number = 1, limit: number = 10): Promise<ContractsResponse> {
    console.log('API: Get contracts for user', userId, 'page:', page);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const allContracts = [
      {
        id: '1',
        name: 'Contrato de Prestação de Serviços',
        description: 'Modelo padrão para prestação de serviços',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        userId,
        sections: []
      },
      {
        id: '2',
        name: 'Contrato de Trabalho',
        description: 'Modelo para contratação de funcionários',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-10T14:30:00Z',
        userId,
        sections: []
      },
      {
        id: '3',
        name: 'Contrato de Locação',
        description: 'Modelo para locação de imóveis',
        createdAt: '2024-01-08T09:15:00Z',
        updatedAt: '2024-01-08T09:15:00Z',
        userId,
        sections: []
      }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const contracts = allContracts.slice(startIndex, endIndex);

    return {
      contracts,
      total: allContracts.length,
      page,
      totalPages: Math.ceil(allContracts.length / limit)
    };
  },

  async filterContracts(userId: string, query: string, page: number = 1, limit: number = 10): Promise<ContractsResponse> {
    console.log('API: Filter contracts', userId, query, 'page:', page);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const allContracts = [
      {
        id: '1',
        name: 'Contrato de Prestação de Serviços',
        description: 'Modelo padrão para prestação de serviços',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        userId,
        sections: []
      },
      {
        id: '2',
        name: 'Contrato de Trabalho',
        description: 'Modelo para contratação de funcionários',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-10T14:30:00Z',
        userId,
        sections: []
      },
      {
        id: '3',
        name: 'Contrato de Locação',
        description: 'Modelo para locação de imóveis',
        createdAt: '2024-01-08T09:15:00Z',
        updatedAt: '2024-01-08T09:15:00Z',
        userId,
        sections: []
      }
    ];

    const filteredContracts = allContracts.filter(contract => 
      contract.name.toLowerCase().includes(query.toLowerCase())
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const contracts = filteredContracts.slice(startIndex, endIndex);

    return {
      contracts,
      total: filteredContracts.length,
      page,
      totalPages: Math.ceil(filteredContracts.length / limit)
    };
  },

  async createContract(data: CreateContractData): Promise<Contract> {
    console.log('API: Create contract', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: '1',
      sections: []
    };
  },

  async updateContract(id: string, data: Partial<CreateContractData>): Promise<Contract> {
    console.log('API: Update contract', id, data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id,
      name: data.name || 'Contract Name',
      description: data.description || 'Contract Description',
      userId: '1',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
      sections: []
    };
  },

  async deleteContract(id: string): Promise<void> {
    console.log('API: Delete contract', id);
    await new Promise(resolve => setTimeout(resolve, 800));
  },

  async downloadContractExample(id: string): Promise<void> {
    console.log('API: Download contract example', id);
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  async getSections(contractId: string): Promise<Section[]> {
    console.log('API: Get sections for contract', contractId);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: '1',
        title: 'Cláusulas Gerais',
        description: 'Estabelece as condições gerais entre as partes contratantes',
        content: '<p>Este contrato estabelece as condições gerais entre as partes <span class="tag-placeholder">#NOME_COMPLETO#</span> e <span class="tag-placeholder">#EMPRESA#</span>.</p>',
        order: 1,
        contractId,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Pagamento',
        description: 'Define valores, prazos e condições de pagamento',
        content: '<p>O valor a ser pago é de <span class="tag-placeholder">#VALOR#</span> até a data <span class="tag-placeholder">#DATA_VENCIMENTO#</span>.</p>',
        order: 2,
        contractId,
        createdAt: '2024-01-15T10:05:00Z',
        updatedAt: '2024-01-15T10:05:00Z'
      }
    ];
  },

  async createSection(data: CreateSectionData): Promise<Section> {
    console.log('API: Create section', data);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: Date.now().toString(),
      ...data,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  async updateSection(id: string, data: Partial<CreateSectionData>): Promise<Section> {
    console.log('API: Update section', id, data);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id,
      title: data.title || 'Updated Section',
      description: data.description || 'Updated description',
      content: data.content || '<p>Updated content</p>',
      contractId: data.contractId || '1',
      order: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    };
  },

  async updateSectionOrder(contractId: string, sectionOrders: { id: string; order: number }[]): Promise<void> {
    console.log('API: Update section order', contractId, sectionOrders);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate API call to update section orders
  },

  async deleteSection(id: string): Promise<void> {
    console.log('API: Delete section', id);
    await new Promise(resolve => setTimeout(resolve, 500));
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

  async importSections(contractId: string, sectionIds: string[]): Promise<void> {
    console.log('API: Import sections', contractId, sectionIds);
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  async processBatchContracts(contractIds: string[], file: File): Promise<void> {
    console.log('API: Process batch contracts', contractIds, file.name);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate file processing and ZIP download
    const link = document.createElement('a');
    link.href = 'data:application/zip;base64,UEsDBAoAAAAAAIdYZ1QAAAAAAAAAAAAAAAAJAAAAbXlmaWxlLnR4dFBLAQIUAAoAAAAAAIdYZ1QAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAABteWZpbGUudHh0UEsFBgAAAAABAAEANwAAAB8AAAAAAA==';
    link.download = `contratos_lote_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async getGeneratedFiles(userId: string, page: number = 1, limit: number = 10): Promise<GeneratedFilesResponse> {
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
    console.log('API: Download generated file', fileId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate file download
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxOTQKJSVFT0Y=';
    link.download = `arquivo_gerado_${fileId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default api;
