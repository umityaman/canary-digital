import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  PictureAsPdf as PdfIcon,
  Receipt as InvoiceIcon,
  LocalShipping as ShippingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { deliveryNoteService, DeliveryNote } from '../../services/deliveryNoteService';
import { useNavigate } from 'react-router-dom';

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

export default function DeliveryNoteList() {
  const navigate = useNavigate();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetchDeliveryNotes();
  }, [statusFilter]);

  const fetchDeliveryNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await deliveryNoteService.getAll({
        status: statusFilter || undefined
      });
      setDeliveryNotes(result.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'İrsaliyeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: number) => {
    try {
      await deliveryNoteService.downloadPDF(id);
    } catch (err: any) {
      alert('PDF indirilemedi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConvertToInvoice = async () => {
    if (!selectedNote) return;

    try {
      setConverting(true);
      await deliveryNoteService.convertToInvoice(selectedNote.id);
      setConvertDialogOpen(false);
      setSelectedNote(null);
      await fetchDeliveryNotes();
      alert('İrsaliye başarıyla faturaya dönüştürüldü!');
    } catch (err: any) {
      alert('Faturaya dönüştürülürken hata: ' + (err.response?.data?.message || err.message));
    } finally {
      setConverting(false);
    }
  };

  const handleMarkAsDelivered = async (id: number) => {
    if (!confirm('Bu irsaliyeyi teslim edildi olarak işaretlemek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deliveryNoteService.markAsDelivered(id);
      await fetchDeliveryNotes();
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bu irsaliyeyi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deliveryNoteService.cancel(id);
      await fetchDeliveryNotes();
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const calculateTotal = (note: DeliveryNote) => {
    return note.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">İrsaliyeler</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/delivery-notes/new')}
        >
          Yeni İrsaliye
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" gap={2}>
            <TextField
              select
              label="Durum"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 200 }}
              size="small"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="pending">Beklemede</MenuItem>
              <MenuItem value="delivered">Teslim Edildi</MenuItem>
              <MenuItem value="invoiced">Faturalandı</MenuItem>
              <MenuItem value="cancelled">İptal</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>İrsaliye No</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Müşteri</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Tutar</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveryNotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary">İrsaliye bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                deliveryNotes.map((note) => (
                  <TableRow key={note.id} hover>
                    <TableCell>{note.deliveryNumber}</TableCell>
                    <TableCell>{formatDate(note.deliveryDate)}</TableCell>
                    <TableCell>{note.customer.name}</TableCell>
                    <TableCell>
                      {note.deliveryType === 'sevk' ? 'Sevk' : 'Tahsilat'}
                    </TableCell>
                    <TableCell>{formatCurrency(calculateTotal(note))}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[note.status] || note.status}
                        color={statusColors[note.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        title="Görüntüle"
                        onClick={() => navigate(`/delivery-notes/${note.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="PDF İndir"
                        onClick={() => handleDownloadPDF(note.id)}
                      >
                        <PdfIcon />
                      </IconButton>
                      {note.status === 'pending' && (
                        <IconButton
                          size="small"
                          title="Teslim Edildi"
                          onClick={() => handleMarkAsDelivered(note.id)}
                          color="success"
                        >
                          <ShippingIcon />
                        </IconButton>
                      )}
                      {(note.status === 'pending' || note.status === 'delivered') && !note.invoice && (
                        <IconButton
                          size="small"
                          title="Faturaya Dönüştür"
                          onClick={() => {
                            setSelectedNote(note);
                            setConvertDialogOpen(true);
                          }}
                          color="primary"
                        >
                          <InvoiceIcon />
                        </IconButton>
                      )}
                      {note.status === 'pending' && (
                        <IconButton
                          size="small"
                          title="İptal"
                          onClick={() => handleCancel(note.id)}
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Convert to Invoice Dialog */}
      <Dialog open={convertDialogOpen} onClose={() => setConvertDialogOpen(false)}>
        <DialogTitle>Faturaya Dönüştür</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedNote?.deliveryNumber}</strong> numaralı irsaliyeyi faturaya dönüştürmek istediğinizden emin misiniz?
          </Typography>
          {selectedNote && (
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                Müşteri: {selectedNote.customer.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tutar: {formatCurrency(calculateTotal(selectedNote))}
              </Typography>
            </Box>
          )}
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
