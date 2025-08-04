
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
}

export interface Contract {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  contractId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Context {
  id: string;
  name: string;
  description?: string;
  userId: string;
}

export interface Tag {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  description: string;
  userId: string;
  contextId: string;
  context?: Context;
  options?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreateContractData {
  name: string;
  description: string;
}

export interface CreateSectionData {
  title: string;
  description: string;
  content: string;
  contractId: string;
}

export interface CreateTagData {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  description: string;
  contextId: string;
  options?: string[];
}

export interface CreateContextData {
  name: string;
  description?: string;
}

export interface UpdateProfileData {
  email?: string;
  name?: string;
  avatar?: string | File;
  companyId?: string;
  password?: string;
}

export interface ContractsResponse {
  contracts: Contract[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GeneratedFile {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
  templateName?: string;
  userName?: string;
}

export interface GeneratedFilesResponse {
  files: GeneratedFile[];
  total: number;
  page: number;
  totalPages: number;
}
