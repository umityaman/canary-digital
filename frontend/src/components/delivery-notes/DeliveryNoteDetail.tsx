import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  Receipt as InvoiceIcon,
  LocalShipping as ShippingIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { deliveryNoteService, DeliveryNote } from '../../services/deliveryNoteService';

const statusColors: { [key: string]: 'default' | 'warning' | 'success' | 'error' | 'info' } = {
  pending: 'warning',
  delivered: 'success',
  invoiced: 'info',
  cancelled: 'error'
};

const statusLabels: { [key: string]: string } = {
  pending: 'Beklemede',
  delivered: 'Teslim Edildi',
  invoiced: 'Faturalandı',
  cancelled: 'İptal'
};

const transportModeLabels: { [key: string]: string } = {
  kara: 'Kara Yolu',
  hava: 'Hava Yolu',
  deniz: 'Deniz Yolu',
  demir: 'Demir Yolu'
};

export default function DeliveryNoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeliveryNote();
    }
  }, [id]);

  const fetchDeliveryNote = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await deliveryNoteService.getById(parseInt(id));
      setDeliveryNote(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'İrsaliye yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    
    try {
      await deliveryNoteService.downloadPDF(parseInt(id));
    } catch (err: any) {
      alert('PDF indirilemedi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConvertToInvoice = async () => {
    if (!id) return;

    try {
      setConverting(true);
      await deliveryNoteService.convertToInvoice(parseInt(id));
      setConvertDialogOpen(false);
      await fetchDeliveryNote();
      alert('İrsaliye başarıyla faturaya dönüştürüldü!');
    } catch (err: any) {
      alert('Faturaya dönüştürülürken hata: ' + (err.response?.data?.message || err.message));
    } finally {
      setConverting(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!id || !confirm('Bu irsaliyeyi teslim edildi olarak işaretlemek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deliveryNoteService.markAsDelivered(parseInt(id));
      await fetchDeliveryNote();
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async () => {
    if (!id || !confirm('Bu irsaliyeyi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deliveryNoteService.cancel(parseInt(id));
      await fetchDeliveryNote();
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateSubtotal = () => {
    if (!deliveryNote) return 0;
    return deliveryNote.items.reduce((sum, item) => {
      return sum + calculateItemTotal(item.quantity, item.unitPrice);
    }, 0);
  };

  const calculateVAT = () => {
    if (!deliveryNote) return 0;
    return deliveryNote.items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item.quantity, item.unitPrice);
      return sum + (itemTotal * item.vatRate / 100);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !deliveryNote) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'İrsaliye bulunamadı'}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/delivery-notes')}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/delivery-notes')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4">İrsaliye Detayı</Typography>
            <Typography variant="body2" color="textSecondary">
              {deliveryNote.deliveryNumber}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Chip
            label={statusLabels[deliveryNote.status] || deliveryNote.status}
            color={statusColors[deliveryNote.status] || 'default'}
          />
        </Box>
      </Box>

      {/* Actions */}
      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        <Button
          startIcon={<PdfIcon />}
          variant="outlined"
          onClick={handleDownloadPDF}
        >
          PDF İndir
        </Button>
        
        {deliveryNote.status === 'pending' && (
          <>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => navigate(`/delivery-notes/${id}/edit`)}
            >
              Düzenle
            </Button>
            <Button
              startIcon={<ShippingIcon />}
              variant="contained"
              color="success"
              onClick={handleMarkAsDelivered}
            >
              Teslim Edildi
            </Button>
          </>
        )}
        
        {(deliveryNote.status === 'pending' || deliveryNote.status === 'delivered') && !deliveryNote.invoice && (
          <Button
            startIcon={<InvoiceIcon />}
            variant="contained"
            color="primary"
            onClick={() => setConvertDialogOpen(true)}
          >
            Faturaya Dönüştür
          </Button>
        )}
        
        {deliveryNote.status === 'pending' && (
          <Button
            startIcon={<CancelIcon />}
            variant="outlined"
            color="error"
            onClick={handleCancel}
          >
            İptal Et
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Genel Bilgiler</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">İrsaliye No:</Typography>
                  <Typography variant="body1" fontWeight="bold">{deliveryNote.deliveryNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Teslim Tarihi:</Typography>
                  <Typography variant="body1">{formatDate(deliveryNote.deliveryDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Tip:</Typography>
                  <Typography variant="body1">
                    {deliveryNote.deliveryType === 'sevk' ? 'Sevk' : 'Tahsilat'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Oluşturulma:</Typography>
                  <Typography variant="body1">{formatDateTime(deliveryNote.createdAt)}</Typography>
                </Grid>
                {deliveryNote.invoice && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Fatura:</Typography>
                    <Button
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => navigate(`/invoices/${deliveryNote.invoice.id}`)}
                    >
                      {deliveryNote.invoice.invoiceNumber}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Müşteri Bilgileri</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                {deliveryNote.customer.name}
              </Typography>
              {deliveryNote.customer.email && (
                <Typography variant="body2" gutterBottom>
                  📧 {deliveryNote.customer.email}
                </Typography>
              )}
              {deliveryNote.customer.phone && (
                <Typography variant="body2" gutterBottom>
                  📞 {deliveryNote.customer.phone}
                </Typography>
              )}
              {deliveryNote.shippingAddress && (
                <>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Teslimat Adresi:
                  </Typography>
                  <Typography variant="body2">
                    {deliveryNote.shippingAddress}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Logistics Info */}
        {(deliveryNote.carrierName || deliveryNote.vehiclePlate || deliveryNote.driverName) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Lojistik Bilgileri</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {deliveryNote.carrierName && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Taşıyıcı:</Typography>
                      <Typography variant="body1">{deliveryNote.carrierName}</Typography>
                      {deliveryNote.carrierPhone && (
                        <Typography variant="body2">📞 {deliveryNote.carrierPhone}</Typography>
                      )}
                    </Grid>
                  )}
                  {deliveryNote.vehiclePlate && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Araç Plakası:</Typography>
                      <Typography variant="body1">{deliveryNote.vehiclePlate}</Typography>
                    </Grid>
                  )}
                  {deliveryNote.driverName && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Sürücü:</Typography>
                      <Typography variant="body1">{deliveryNote.driverName}</Typography>
                      {deliveryNote.driverPhone && (
                        <Typography variant="body2">📞 {deliveryNote.driverPhone}</Typography>
                      )}
                    </Grid>
                  )}
                  {deliveryNote.transportMode && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Taşıma Şekli:</Typography>
                      <Typography variant="body1">
                        {transportModeLabels[deliveryNote.transportMode] || deliveryNote.transportMode}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Kalemler</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Açıklama</TableCell>
                      <TableCell align="right">Miktar</TableCell>
                      <TableCell>Birim</TableCell>
                      <TableCell align="right">Birim Fiyat</TableCell>
                      <TableCell align="right">KDV %</TableCell>
                      <TableCell align="right">Toplam</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveryNote.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.description}
                          {item.equipment && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              {item.equipment.name}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{item.vatRate}%</TableCell>
                        <TableCell align="right">
                          {formatCurrency(calculateItemTotal(item.quantity, item.unitPrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totals */}
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Box width={300}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Ara Toplam:</Typography>
                    <Typography>{formatCurrency(calculateSubtotal())}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>KDV:</Typography>
                    <Typography>{formatCurrency(calculateVAT())}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" borderTop={1} pt={1}>
                    <Typography variant="h6">Genel Toplam:</Typography>
                    <Typography variant="h6">{formatCurrency(calculateGrandTotal())}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes */}
        {deliveryNote.notes && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notlar</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" whiteSpace="pre-wrap">
                  {deliveryNote.notes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Convert to Invoice Dialog */}
      <Dialog open={convertDialogOpen} onClose={() => setConvertDialogOpen(false)}>
        <DialogTitle>Faturaya Dönüştür</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Bu işlem geri alınamaz. İrsaliye otomatik olarak "Faturalandı" durumuna geçecektir.
          </Alert>
          <Typography gutterBottom>
            <strong>{deliveryNote.deliveryNumber}</strong> numaralı irsaliyeyi faturaya dönüştürmek istediğinizden emin misiniz?
          </Typography>
          <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
            <Typography variant="body2" color="textSecondary">Müşteri:</Typography>
            <Typography variant="body1" gutterBottom>{deliveryNote.customer.name}</Typography>
            
            <Typography variant="body2" color="textSecondary">Tutar:</Typography>
            <Typography variant="h6">{formatCurrency(calculateGrandTotal())}</Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Kalem Sayısı: {deliveryNote.items.length}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleConvertToInvoice}
            variant="contained"
            disabled={converting}
          >
            {converting ? <CircularProgress size={24} /> : 'Faturaya Dönüştür'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
