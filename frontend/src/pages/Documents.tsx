import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Search, 
  RefreshCw,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import DocumentUploader from '@/components/documents/DocumentUploader';
import DocumentBrowser from '@/components/documents/DocumentBrowser';
import DocumentSearch from '@/components/documents/DocumentSearch';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// API Types
interface Document {
  id: number;
  name: string;
  filePath: string;
  mimeType: string;
  size: number;
  version: number;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    color?: string;
  };
  uploadedBy: {
    id: number;
    name: string;
    email: string;
  };
  uploadedAt: string;
  updatedAt: string;
  tags?: string[];
  description?: string;
  isShared?: boolean;
  isFavorite?: boolean;
  thumbnail?: string;
  shareCount?: number;
  downloadCount?: number;
}

interface DocumentCategory {
  id: number;
  name: string;
  color?: string;
  documentCount?: number;
  parentId?: number;
  children?: DocumentCategory[];
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface SearchFilters {
  query?: string;
  categoryIds?: number[];
  uploadedByIds?: number[];
  tags?: string[];
  mimeTypes?: string[];
  sizeMin?: number;
  sizeMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  hasShares?: boolean;
  isFavorite?: boolean;
  sortBy?: 'name' | 'date' | 'size' | 'type' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export default function Documents() {
  const { toast } = useToast();
  
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableMimeTypes, setAvailableMimeTypes] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  
  const [activeTab, setActiveTab] = useState('browse');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Load initial data
  useEffect(() => {
    loadDocuments();
    loadCategories();
    loadUsers();
    loadMetadata();
  }, []);

  // API Functions
  const loadDocuments = useCallback(async (filters?: SearchFilters) => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockDocuments: Document[] = [
        {
          id: 1,
          name: 'Sözleşme_2024.pdf',
          filePath: '/documents/contract.pdf',
          mimeType: 'application/pdf',
          size: 2048576,
          version: 1,
          categoryId: 1,
          category: { id: 1, name: 'Sözleşmeler', color: '#3B82F6' },
          uploadedBy: { id: 1, name: 'Ali Veli', email: 'ali@example.com' },
          uploadedAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          tags: ['sözleşme', 'kiralama'],
          description: 'Ekipman kiralama sözleşmesi',
          downloadCount: 5,
          shareCount: 2
        }
      ];
      
      setDocuments(mockDocuments);
      
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Hata',
        description: 'Dokümanlar yüklenirken hata oluştu',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadCategories = async () => {
    try {
      const mockCategories: DocumentCategory[] = [
        { id: 1, name: 'Sözleşmeler', color: '#3B82F6', documentCount: 15 },
        { id: 2, name: 'Faturalar', color: '#10B981', documentCount: 23 },
        { id: 3, name: 'Raporlar', color: '#F59E0B', documentCount: 8 }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const mockUsers: User[] = [
        { id: 1, name: 'Ali Veli', email: 'ali@example.com' },
        { id: 2, name: 'Ayşe Kaya', email: 'ayse@example.com' }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMetadata = async () => {
    try {
      setAvailableTags(['sözleşme', 'fatura', 'rapor', 'kiralama']);
      setAvailableMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doküman Yönetimi</h1>
          <p className="text-gray-600 mt-1">
            Dosyalarınızı yükleyin, organize edin ve paylaşın
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Badge variant="secondary">{documents.length}</Badge>
              <span>dosya</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDocuments(searchFilters)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Gözat
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Arama
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Yükle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Doküman Tarayıcısı</h3>
            <p className="text-gray-600">Dosyalarınızı görüntüleyin ve yönetin</p>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gelişmiş Arama</h3>
            <p className="text-gray-600">Dosyalarınızı filtreleyerek arayın</p>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <DocumentUploader
            onUpload={async (files: File[]) => {
              toast({
                title: 'Başarılı',
                description: `${files.length} dosya yüklendi`
              });
              setActiveTab('browse');
            }}
            maxFiles={20}
            maxSize={100 * 1024 * 1024}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}