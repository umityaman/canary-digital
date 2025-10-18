import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  Tag,
  FolderOpen,
  FileText,
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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

interface DocumentCategory {
  id: number;
  name: string;
  color?: string;
  documentCount?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface DocumentSearchProps {
  filters: SearchFilters;
  categories: DocumentCategory[];
  users: User[];
  availableTags: string[];
  availableMimeTypes: string[];
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  isSearching?: boolean;
  resultCount?: number;
}

const MIME_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word (DOC)',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word (DOCX)',
  'application/vnd.ms-excel': 'Excel (XLS)',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel (XLSX)',
  'text/plain': 'Text',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'video/mp4': 'Video (MP4)',
  'audio/mpeg': 'Audio (MP3)',
  'application/zip': 'ZIP'
};

const SIZE_OPTIONS = [
  { label: 'Küçük (< 1 MB)', min: 0, max: 1024 * 1024 },
  { label: 'Orta (1-10 MB)', min: 1024 * 1024, max: 10 * 1024 * 1024 },
  { label: 'Büyük (10-100 MB)', min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
  { label: 'Çok Büyük (> 100 MB)', min: 100 * 1024 * 1024, max: undefined }
];

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  filters,
  categories,
  users,
  availableTags,
  availableMimeTypes,
  onFiltersChange,
  onSearch,
  onClearFilters,
  isSearching = false,
  resultCount
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localQuery, setLocalQuery] = useState(filters.query || '');

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: any) => {
    const currentArray = (filters[key] as any[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.categoryIds?.length) count++;
    if (filters.uploadedByIds?.length) count++;
    if (filters.tags?.length) count++;
    if (filters.mimeTypes?.length) count++;
    if (filters.sizeMin !== undefined || filters.sizeMax !== undefined) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.hasShares !== undefined) count++;
    if (filters.isFavorite !== undefined) count++;
    return count;
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('query', localQuery || undefined);
    onSearch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Gelişmiş Arama
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} filtre
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {resultCount !== undefined && (
              <span className="text-sm text-gray-500">
                {resultCount} sonuç
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Gizle' : 'Gelişmiş'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <form onSubmit={handleQuickSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Dosya adı, içerik veya açıklama ara..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Ara'
            )}
          </Button>
          {getActiveFilterCount() > 0 && (
            <Button variant="outline" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Temizle
            </Button>
          )}
        </form>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Categories */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Kategoriler
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.categoryIds?.includes(category.id) || false}
                        onCheckedChange={() => toggleArrayFilter('categoryIds', category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        {category.color && (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {category.name}
                        {category.documentCount && (
                          <Badge variant="outline" className="text-xs">
                            {category.documentCount}
                          </Badge>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Types */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Dosya Türleri
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                  {availableMimeTypes.map((mimeType) => (
                    <div key={mimeType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mime-${mimeType}`}
                        checked={filters.mimeTypes?.includes(mimeType) || false}
                        onCheckedChange={() => toggleArrayFilter('mimeTypes', mimeType)}
                      />
                      <label
                        htmlFor={`mime-${mimeType}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {MIME_TYPE_LABELS[mimeType] || mimeType}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Yükleyen Kişi
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={filters.uploadedByIds?.includes(user.id) || false}
                        onCheckedChange={() => toggleArrayFilter('uploadedByIds', user.id)}
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {user.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Başlangıç Tarihi
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {filters.dateFrom ? (
                        format(filters.dateFrom, 'dd MMMM yyyy', { locale: tr })
                      ) : (
                        <span className="text-gray-500">Tarih seç</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter('dateFrom', date)}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Bitiş Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {filters.dateTo ? (
                        format(filters.dateTo, 'dd MMMM yyyy', { locale: tr })
                      ) : (
                        <span className="text-gray-500">Tarih seç</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter('dateTo', date)}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* File Size */}
            <div className="space-y-2">
              <Label>Dosya Boyutu</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SIZE_OPTIONS.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${index}`}
                      checked={
                        filters.sizeMin === option.min && 
                        filters.sizeMax === option.max
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('sizeMin', option.min);
                          updateFilter('sizeMax', option.max);
                        } else {
                          updateFilter('sizeMin', undefined);
                          updateFilter('sizeMax', undefined);
                        }
                      }}
                    />
                    <label
                      htmlFor={`size-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Etiketler
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags?.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleArrayFilter('tags', tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ek Seçenekler</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-shares"
                      checked={filters.hasShares === true}
                      onCheckedChange={(checked) => 
                        updateFilter('hasShares', checked ? true : undefined)
                      }
                    />
                    <label
                      htmlFor="has-shares"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Paylaşılan dosyalar
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-favorite"
                      checked={filters.isFavorite === true}
                      onCheckedChange={(checked) => 
                        updateFilter('isFavorite', checked ? true : undefined)
                      }
                    />
                    <label
                      htmlFor="is-favorite"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Favori dosyalar
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sıralama</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filters.sortBy || 'relevance'}
                    onValueChange={(value) => updateFilter('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">İlgililik</SelectItem>
                      <SelectItem value="name">İsim</SelectItem>
                      <SelectItem value="date">Tarih</SelectItem>
                      <SelectItem value="size">Boyut</SelectItem>
                      <SelectItem value="type">Tür</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder || 'desc'}
                    onValueChange={(value) => updateFilter('sortOrder', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Artan</SelectItem>
                      <SelectItem value="desc">Azalan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Search Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClearFilters}>
                Filtreleri Temizle
              </Button>
              <Button onClick={onSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Aranıyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Gelişmiş Arama
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Aktif Filtreler:</span>
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.query && (
                <Badge variant="secondary">Arama: "{filters.query}"</Badge>
              )}
              {filters.categoryIds?.length && (
                <Badge variant="secondary">
                  {filters.categoryIds.length} kategori
                </Badge>
              )}
              {filters.mimeTypes?.length && (
                <Badge variant="secondary">
                  {filters.mimeTypes.length} dosya türü
                </Badge>
              )}
              {filters.uploadedByIds?.length && (
                <Badge variant="secondary">
                  {filters.uploadedByIds.length} kullanıcı
                </Badge>
              )}
              {filters.tags?.length && (
                <Badge variant="secondary">
                  {filters.tags.length} etiket
                </Badge>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary">Tarih aralığı</Badge>
              )}
              {(filters.sizeMin !== undefined || filters.sizeMax !== undefined) && (
                <Badge variant="secondary">Boyut filtresi</Badge>
              )}
              {filters.hasShares && (
                <Badge variant="secondary">Paylaşılan</Badge>
              )}
              {filters.isFavorite && (
                <Badge variant="secondary">Favoriler</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentSearch;