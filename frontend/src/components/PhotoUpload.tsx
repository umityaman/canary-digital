import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';

interface PhotoUploadProps {
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  photos: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onUpload,
  onRemove,
  photos,
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Format kontrolü
    if (!acceptedFormats.includes(file.type)) {
      return `Geçersiz dosya formatı: ${file.name}. Sadece JPG, PNG, WebP desteklenir.`;
    }

    // Boyut kontrolü
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `Dosya çok büyük: ${file.name} (${sizeMB.toFixed(2)}MB). Maksimum ${maxSizeMB}MB.`;
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');

    // Toplam dosya sayısı kontrolü
    if (photos.length + files.length > maxFiles) {
      setError(`Maksimum ${maxFiles} fotoğraf yükleyebilirsiniz.`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Input'u temizle (aynı dosyayı tekrar seçebilmek için)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging 
            ? 'border-neutral-500 bg-blue-50' 
            : 'border-neutral-300 bg-neutral-50 hover:border-gray-400 hover:bg-neutral-100'
          }
          ${photos.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={photos.length < maxFiles ? triggerFileInput : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={photos.length >= maxFiles}
        />

        <div className="flex flex-col items-center gap-3">
          {isDragging ? (
            <Camera size={48} className="text-blue-500" />
          ) : (
            <Upload size={48} className="text-gray-400" />
          )}

          <div>
            <p className="text-base font-medium text-neutral-700">
              {photos.length >= maxFiles 
                ? 'Maksimum fotoğraf sayısına ulaştınız'
                : 'Fotoğrafları sürükleyin veya tıklayın'
              }
            </p>
            {photos.length < maxFiles && (
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG, WebP • Maksimum {maxSizeMB}MB • {maxFiles - photos.length} fotoğraf daha ekleyebilirsiniz
              </p>
            )}
          </div>

          {photos.length < maxFiles && (
            <button
              type="button"
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
            >
              Dosya Seç
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-neutral-700">
              Yüklenen Fotoğraflar ({photos.length}/{maxFiles})
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 hover:border-neutral-300 transition-all"
              >
                {/* Image Preview */}
                <img
                  src={photo}
                  alt={`Fotoğraf ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    title="Fotoğrafı Sil"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Image Number Badge */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !error && (
        <div className="text-center py-4">
          <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Henüz fotoğraf yüklenmedi</p>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
