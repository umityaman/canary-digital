import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Download, 
  Share, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  Calendar,
  User,
  Tag,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File as FileIcon,
  Folder,
  FolderOpen,
  Star,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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

interface DocumentBrowserProps {
  documents: Document[];
  categories: DocumentCategory[];
  loading?: boolean;
  view?: 'grid' | 'list';
  selectedCategory?: number;
  searchQuery?: string;
  sortBy?: 'name' | 'date' | 'size' | 'type';
  sortOrder?: 'asc' | 'desc';
  onViewChange?: (view: 'grid' | 'list') => void;
  onCategoryChange?: (categoryId?: number) => void;
  onSearchChange?: (query: string) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onDocumentSelect?: (document: Document) => void;
  onDocumentDownload?: (document: Document) => void;
  onDocumentShare?: (document: Document) => void;
  onDocumentEdit?: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  onDocumentPreview?: (document: Document) => void;
  onFavoriteToggle?: (document: Document) => void;
}

export const DocumentBrowser: React.FC<DocumentBrowserProps> = ({
  documents,
  categories,
  loading = false,
  view = 'grid',
  selectedCategory,
  searchQuery = '',
  sortBy = 'date',
  sortOrder = 'desc',
  onViewChange,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onDocumentSelect,
  onDocumentDownload,
  onDocumentShare,
  onDocumentEdit,
  onDocumentDelete,
  onDocumentPreview,
  onFavoriteToggle
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange]);

  const getFileIcon = (mimeType: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-12 h-12'
    };

    if (mimeType.startsWith('image/')) 
      return <Image className={`${sizeClasses[size]} text-blue-500`} />;
    if (mimeType.startsWith('video/')) 
      return <Video className={`${sizeClasses[size]} text-purple-500`} />;
    if (mimeType.startsWith('audio/')) 
      return <Music className={`${sizeClasses[size]} text-green-500`} />;
    if (mimeType.includes('pdf')) 
      return <FileText className={`${sizeClasses[size]} text-red-500`} />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) 
      return <Archive className={`${sizeClasses[size]} text-yellow-500`} />;
    
    return <FileIcon className={`${sizeClasses[size]} text-gray-500`} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: tr });
  };

  const getCategoryColor = (category?: DocumentCategory['category']) => {
    return category?.color || '#6B7280';
  };

  const DocumentGridCard: React.FC<{ document: Document }> = ({ document }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => onDocumentSelect?.(document)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Thumbnail or Icon */}
          <div className="relative">
            {document.thumbnail ? (
              <img
                src={document.thumbnail}
                alt={document.name}
                className="w-full h-32 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-neutral-100 rounded-md">
                {getFileIcon(document.mimeType, 'lg')}
              </div>
            )}
            
            {/* Favorite Star */}
            {document.isFavorite && (
              <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-500 fill-current" />
            )}
            
            {/* Quick Actions */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDocumentPreview?.(document); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    Önizle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDocumentDownload?.(document); }}>
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDocumentShare?.(document); }}>
                    <Share className="w-4 h-4 mr-2" />
                    Paylaş
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDocumentEdit?.(document); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDocumentDelete?.(document); }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm truncate" title={document.name}>
              {document.name}
            </h4>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(document.size)}</span>
              <span>{formatDate(document.uploadedAt)}</span>
            </div>

            {/* Category */}
            {document.category && (
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ backgroundColor: `${getCategoryColor(document.category)}20`, color: getCategoryColor(document.category) }}
              >
                {document.category.name}
              </Badge>
            )}

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {document.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{document.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                {document.shareCount && document.shareCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Share className="w-3 h-3" />
                    {document.shareCount}
                  </span>
                )}
                {document.downloadCount && document.downloadCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {document.downloadCount}
                  </span>
                )}
              </div>
              {document.version > 1 && (
                <span>v{document.version}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DocumentListItem: React.FC<{ document: Document }> = ({ document }) => (
    <div 
      className="flex items-center gap-4 p-4 border-b hover:bg-neutral-50 cursor-pointer group"
      onClick={() => onDocumentSelect?.(document)}
    >
      {/* File Icon/Thumbnail */}
      <div className="flex-shrink-0">
        {document.thumbnail ? (
          <img
            src={document.thumbnail}
            alt={document.name}
            className="w-12 h-12 object-cover rounded border"
          />
        ) : (
          getFileIcon(document.mimeType, 'lg')
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{document.name}</h4>
          {document.isFavorite && (
            <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
          )}
          {document.version > 1 && (
            <Badge variant="outline" className="text-xs">v{document.version}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{formatFileSize(document.size)}</span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {document.uploadedBy.name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(document.uploadedAt)}
          </span>
        </div>

        {/* Category and Tags */}
        <div className="flex items-center gap-2">
          {document.category && (
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ backgroundColor: `${getCategoryColor(document.category)}20`, color: getCategoryColor(document.category) }}
            >
              {document.category.name}
            </Badge>
          )}
          {document.tags && document.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {document.shareCount && document.shareCount > 0 && (
          <span className="flex items-center gap-1">
            <Share className="w-4 h-4" />
            {document.shareCount}
          </span>
        )}
        {document.downloadCount && document.downloadCount > 0 && (
          <span className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {document.downloadCount}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDocumentPreview?.(document); }}>
              <Eye className="w-4 h-4 mr-2" />
              Önizle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDocumentDownload?.(document); }}>
              <Download className="w-4 h-4 mr-2" />
              İndir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDocumentShare?.(document); }}>
              <Share className="w-4 h-4 mr-2" />
              Paylaş
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDocumentEdit?.(document); }}>
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDocumentDelete?.(document); }}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Dosyalarda ara..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters and View Controls */}
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <Select value={selectedCategory?.toString()} onValueChange={(value) => onCategoryChange?.(value ? parseInt(value) : undefined)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Kategori seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color || '#6B7280' }}
                    />
                    {category.name}
                    {category.documentCount && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {category.documentCount}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select 
            value={`${sortBy}-${sortOrder}`} 
            onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-') as [string, 'asc' | 'desc'];
              onSortChange?.(newSortBy, newSortOrder);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">İsim (A-Z)</SelectItem>
              <SelectItem value="name-desc">İsim (Z-A)</SelectItem>
              <SelectItem value="date-desc">Tarih (Yeni)</SelectItem>
              <SelectItem value="date-asc">Tarih (Eski)</SelectItem>
              <SelectItem value="size-desc">Boyut (Büyük)</SelectItem>
              <SelectItem value="size-asc">Boyut (Küçük)</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange?.('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange?.('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Documents */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FileIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Dosya bulunamadı</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Arama kriterlerinize uygun dosya bulunamadı.' : 'Henüz dosya yüklenmemiş.'}
          </p>
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {documents.map((document) => (
                <DocumentGridCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                {documents.map((document) => (
                  <DocumentListItem key={document.id} document={document} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Results Summary */}
      {documents.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {documents.length} dosya gösteriliyor
          {searchQuery && ` "${searchQuery}" için`}
          {selectedCategory && ` "${categories.find(c => c.id === selectedCategory)?.name}" kategorisinde`}
        </div>
      )}
    </div>
  );
};

export default DocumentBrowser;