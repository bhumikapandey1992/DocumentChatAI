export interface Document {
  id: string;
  backendId: number;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Source[];
}

export interface Source {
  id: string;
  documentName: string;
  page?: number;
  snippet: string;
}
