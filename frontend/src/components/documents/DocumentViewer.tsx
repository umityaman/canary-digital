import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Download, 
  Share, 
  Edit, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File as FileIcon,
  ExternalLink,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  thumbnail?: string;
  shareCount?: number;
  downloadCount?: number;
  isShared?: boolean;
  isFavorite?: boolean;
}

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (document: Document) => void;
  onShare?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
  onShare,
  onEdit,
  onDelete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (document && isOpen) {
      // Reset viewer state
      setZoom(100);
      setRotation(0);
      setIsFullscreen(false);
      setIsLoading(true);
      
      // Generate preview URL based on document type
      generatePreviewUrl(document);
    }
  }, [document, isOpen]);

  const generatePreviewUrl = async (doc: Document) => {
    try {
      // For images, use direct URL
      if (doc.mimeType.startsWith('image/')) {
        setPreviewUrl(`/api/documents/${doc.id}/download`);
        setIsLoading(false);
        return;
      }

      // For PDFs, use browser's built-in viewer
      if (doc.mimeType === 'application/pdf') {
        setPreviewUrl(`/api/documents/${doc.id}/download`);
        setIsLoading(false);
        return;
      }

      // For other files, check if preview is available
      const response = await fetch(`/api/documents/${doc.id}/preview`);
      if (response.ok) {
        const blob = await response.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-16 h-16 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-16 h-16 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-16 h-16 text-green-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-16 h-16 text-red-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-16 h-16 text-yellow-500" />;
    return <FileIcon className="w-16 h-16 text-gray-500" />;
  };

  const canPreview = (mimeType: string) => {
    return mimeType.startsWith('image/') || 
           mimeType === 'application/pdf' ||
           mimeType.startsWith('text/') ||
           mimeType.startsWith('video/') ||
           mimeType.startsWith('audio/');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const PreviewContent = () => {
    if (!document) return null;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Önizleme yükleniyor...</span>
        </div>
      );
    }

    if (!canPreview(document.mimeType) || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
          {getFileIcon(document.mimeType)}
          <h3 className="mt-4 text-lg font-medium text-gray-900">{document.name}</h3>
          <p className="mt-2 text-sm text-gray-500">
            Bu dosya türü için önizleme desteklenmiyor
          </p>
          <Button
            className="mt-4"
            onClick={() => onDownload?.(document)}
          >
            <Download className="w-4 h-4 mr-2" />
            Dosyayı İndir
          </Button>
        </div>
      );
    }

    // Image Preview
    if (document.mimeType.startsWith('image/')) {
      return (
        <div className="relative overflow-hidden bg-gray-100 rounded-lg" style={{ height: isFullscreen ? '80vh' : '500px' }}>
          <img
            src={previewUrl}
            alt={document.name}
            className="w-full h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        </div>
      );
    }

    // PDF Preview
    if (document.mimeType === 'application/pdf') {
      return (
        <div className="relative bg-gray-100 rounded-lg" style={{ height: isFullscreen ? '80vh' : '600px' }}>
          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
            className="w-full h-full border-0 rounded-lg"
            title={document.name}
          />
        </div>
      );
    }

    // Video Preview
    if (document.mimeType.startsWith('video/')) {
      return (
        <div className="relative bg-black rounded-lg" style={{ height: isFullscreen ? '80vh' : '400px' }}>
          <video
            src={previewUrl}
            controls
            className="w-full h-full rounded-lg"
            preload="metadata"
          >
            Tarayıcınız video oynatmayı desteklemiyor.
          </video>
        </div>
      );
    }

    // Audio Preview
    if (document.mimeType.startsWith('audio/')) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <Music className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-4">{document.name}</h3>
          <audio src={previewUrl} controls className="w-full max-w-md">
            Tarayıcınız ses oynatmayı desteklemiyor.
          </audio>
        </div>
      );
    }

    // Text Preview
    if (document.mimeType.startsWith('text/')) {
      return (
        <div className="bg-gray-50 rounded-lg p-4" style={{ height: isFullscreen ? '70vh' : '400px' }}>
          <iframe
            src={previewUrl}
            className="w-full h-full border-0 bg-white rounded"
            title={document.name}
          />
        </div>
      );
    }

    return null;
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-7xl ${isFullscreen ? 'w-screen h-screen max-h-screen' : 'max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 truncate">
              <Eye className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{document.name}</span>
              {document.version > 1 && (
                <Badge variant="outline">v{document.version}</Badge>
              )}
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {/* Navigation */}
              {(hasPrevious || hasNext) && (
                <div className="flex items-center gap-1 mr-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNext}
                    disabled={!hasNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Zoom Controls (for images) */}
              {document.mimeType.startsWith('image/') && (
                <div className="flex items-center gap-1 mr-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-12 text-center">
                    {zoom}%
                  </span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRotate}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Fullscreen Toggle */}
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>

              {/* Actions */}
              <Button variant="outline" size="sm" onClick={() => onDownload?.(document)}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onShare?.(document)}>
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit?.(document)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-4 h-full overflow-hidden">
          {/* Main Preview Area */}
          <div className="flex-1 overflow-hidden">
            <PreviewContent />
          </div>

          {/* Document Info Sidebar */}
          {!isFullscreen && (
            <Card className="w-80 flex-shrink-0 overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Dosya Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Bilgiler</TabsTrigger>
                    <TabsTrigger value="activity">Aktivite</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Dosya Adı</label>
                        <p className="text-sm text-gray-900 break-words">{document.name}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Boyut</label>
                        <p className="text-sm text-gray-900">{formatFileSize(document.size)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tür</label>
                        <p className="text-sm text-gray-900">{document.mimeType}</p>
                      </div>
                      
                      {document.category && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Kategori</label>
                          <Badge 
                            variant="secondary" 
                            className="mt-1"
                            style={{ 
                              backgroundColor: `${document.category.color || '#6B7280'}20`, 
                              color: document.category.color || '#6B7280' 
                            }}
                          >
                            {document.category.name}
                          </Badge>
                        </div>
                      )}
                      
                      {document.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Açıklama</label>
                          <p className="text-sm text-gray-900">{document.description}</p>
                        </div>
                      )}
                      
                      {document.tags && document.tags.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Etiketler</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {document.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Yükleyen</label>
                        <p className="text-sm text-gray-900">{document.uploadedBy.name}</p>
                        <p className="text-xs text-gray-500">{document.uploadedBy.email}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Yüklenme Tarihi</label>
                        <p className="text-sm text-gray-900">{formatDate(document.uploadedAt)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Son Güncelleme</label>
                        <p className="text-sm text-gray-900">{formatDate(document.updatedAt)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Versiyon</label>
                        <p className="text-sm text-gray-900">v{document.version}</p>
                      </div>
                      
                      {(document.shareCount !== undefined || document.downloadCount !== undefined) && (
                        <div className="space-y-2 pt-2 border-t">
                          <label className="text-sm font-medium text-gray-700">İstatistikler</label>
                          {document.downloadCount !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">İndirme sayısı:</span>
                              <span className="font-medium">{document.downloadCount}</span>
                            </div>
                          )}
                          {document.shareCount !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Paylaşım sayısı:</span>
                              <span className="font-medium">{document.shareCount}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => onDownload?.(document)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => onShare?.(document)}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Paylaş
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => onEdit?.(document)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </Button>
                  {onDelete && (
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => onDelete(document)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Sil
                    </Button>
                  )}
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(`/api/documents/${document.id}/download`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Yeni Sekmede Aç
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;