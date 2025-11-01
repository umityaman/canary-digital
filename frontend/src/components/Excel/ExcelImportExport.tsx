import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Description as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  GetApp as TemplateIcon
} from '@mui/icons-material';
import { apiClient } from '../../utils/api';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const ExcelImportExport: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = async (type: 'customers' | 'products') => {
    if (!selectedFile) {
      alert('Lütfen bir dosya seçin');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await apiClient.post(`/excel/import/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResult(response.data);
      setResultDialog(true);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error importing file:', error);
      alert('İçe aktarma başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (type: string, filters?: any) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }

      const response = await apiClient.get(`/excel/export/${type}?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Dışa aktarma başarısız');
    }
  };

  const handleDownloadTemplate = async (type: 'customers' | 'products') => {
    try {
      const response = await apiClient.get(`/excel/templates/${type}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Şablon indirme başarısız');
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Export Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DownloadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Excel'e Aktar
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Verilerinizi Excel formatında dışa aktarın
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <FileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Faturalar"
                    secondary="Tüm fatura kayıtlarınızı Excel'e aktarın"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleExport('invoices')}
                  >
                    İndir
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <FileIcon color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Giderler"
                    secondary="Tüm gider kayıtlarınızı Excel'e aktarın"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleExport('expenses')}
                  >
                    İndir
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <FileIcon color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Stok Hareketleri"
                    secondary="Stok hareketlerinizi Excel'e aktarın"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleExport('stock-movements')}
                  >
                    İndir
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Import Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <UploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Excel'den Aktar
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Toplu veri yükleme için Excel dosyası yükleyin
              </Typography>

              <Paper sx={{ p: 3, mb: 2, bgcolor: 'background.default' }}>
                <input
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Dosya Seç
                  </Button>
                </label>
                {selectedFile && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Seçili dosya: {selectedFile.name}
                  </Alert>
                )}
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleImport('customers')}
                    disabled={!selectedFile || uploading}
                  >
                    Müşteri İçe Aktar
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleImport('products')}
                    disabled={!selectedFile || uploading}
                  >
                    Ürün İçe Aktar
                  </Button>
                </Grid>
              </Grid>

              {uploading && <LinearProgress sx={{ mt: 2 }} />}
            </CardContent>
          </Card>
        </Grid>

        {/* Templates Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TemplateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Excel Şablonları
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                İçe aktarma için örnek Excel şablonlarını indirin
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Müşteri Şablonu
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Müşteri bilgilerini toplu olarak içe aktarmak için bu şablonu kullanın.
                      Sütunlar: Ad Soyad, E-posta, Telefon, Adres, Vergi No, Vergi Dairesi
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadTemplate('customers')}
                    >
                      Şablonu İndir
                    </Button>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Ürün Şablonu
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Ürün bilgilerini toplu olarak içe aktarmak için bu şablonu kullanın.
                      Sütunlar: Ürün Adı, SKU, Barkod, Kategori, Fiyat, Stok, Min. Stok, Birim
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadTemplate('products')}
                    >
                      Şablonu İndir
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Import Result Dialog */}
      <Dialog open={resultDialog} onClose={() => setResultDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>İçe Aktarma Sonucu</DialogTitle>
        <DialogContent>
          {importResult && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <SuccessIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {importResult.success}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Başarılı
                  </Typography>
                </Box>
              </Box>

              {importResult.failed > 0 && (
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" color="error.main">
                      {importResult.failed}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Başarısız
                    </Typography>
                  </Box>
                </Box>
              )}

              {importResult.errors.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Hatalar:
                  </Typography>
                  <List dense>
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={error}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                    {importResult.errors.length > 10 && (
                      <Typography variant="caption" color="textSecondary">
                        ... ve {importResult.errors.length - 10} hata daha
                      </Typography>
                    )}
                  </List>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog(false)} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExcelImportExport;
