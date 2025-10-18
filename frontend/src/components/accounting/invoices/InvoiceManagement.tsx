import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Search,
  Receipt,
  Payment,
  Download,
  Edit,
  Visibility,
  Add,
  FilterList,
  MonetizationOn,
  Person,
  CalendarToday,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/api';

interface Invoice {
  id: number;
  invoice_no: string;
  issue_date: string;
  due_date: string;
  contact_id: number;
  contact_name: string;
  description: string;
  currency: string;
  exchange_rate: number;
  gross_total: number;
  total_paid: number;
  remaining: number;
  payment_status: 'paid' | 'unpaid' | 'overdue' | 'partial';
  status: string;
  invoice_series: string;
  invoice_id: number;
  tags: string[];
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: number;
  product_id: number;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  gross_total: number;
}

interface InvoiceFilters {
  search: string;
  contact_id?: number;
  payment_status?: string;
  issue_date_start?: Date | null;
  issue_date_end?: Date | null;
  due_date_start?: Date | null;
  due_date_end?: Date | null;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  contact_type: string;
}

interface PaymentForm {
  amount: string;
  account_id: string;
  date: Date;
  description: string;
}

export const InvoiceManagement: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    payment_status: '',
    issue_date_start: null,
    issue_date_end: null,
    due_date_start: null,
    due_date_end: null
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    amount: '',
    account_id: '',
    date: new Date(),
    description: ''
  });

  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadInvoices();
    loadContacts();
    loadAccounts();
  }, [page, rowsPerPage, filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (page + 1).toString(),
        per_page: rowsPerPage.toString(),
        sort: '-issue_date'
      });

      // Add filters
      if (filters.search) {
        params.append('q', filters.search);
      }
      if (filters.contact_id) {
        params.append('contact_id', filters.contact_id.toString());
      }
      if (filters.payment_status) {
        params.append('payment_status', filters.payment_status);
      }
      if (filters.issue_date_start) {
        params.append('issue_date_gte', filters.issue_date_start.toISOString().split('T')[0]);
      }
      if (filters.issue_date_end) {
        params.append('issue_date_lte', filters.issue_date_end.toISOString().split('T')[0]);
      }

      const response = await apiClient.get(`/parasut/invoices?${params}`);
      
      if (response.data.invoices) {
        setInvoices(response.data.invoices);
        setTotalCount(response.data.meta?.total_count || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Faturalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await apiClient.get('/parasut/contacts?contact_type=customer&per_page=100');
      if (response.data.contacts) {
        setContacts(response.data.contacts);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await apiClient.get('/parasut/accounts');
      if (response.data.accounts) {
        setAccounts(response.data.accounts);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const handleCreateInvoiceFromContract = async (contractId: number) => {
    try {
      setProcessing(true);
      
      const response = await apiClient.post(`/parasut/contracts/${contractId}/invoice`);
      
      if (response.data.success) {
        await loadInvoices();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fatura oluşturulurken hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentForm.amount || !paymentForm.account_id) {
      return;
    }

    try {
      setProcessing(true);
      
      const response = await apiClient.post(`/parasut/invoices/${selectedInvoice.id}/payment`, {
        amount: parseFloat(paymentForm.amount),
        account_id: parseInt(paymentForm.account_id),
        date: paymentForm.date.toISOString().split('T')[0],
        description: paymentForm.description
      });
      
      if (response.data.success) {
        setPaymentOpen(false);
        setPaymentForm({
          amount: '',
          account_id: '',
          date: new Date(),
          description: ''
        });
        await loadInvoices();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ödeme kaydedilirken hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  };

  const handlePaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      ...paymentForm,
      amount: invoice.remaining.toString()
    });
    setPaymentOpen(true);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'unpaid': return 'warning';
      case 'overdue': return 'error';
      case 'partial': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const isOverdue = (dueDate: string, paymentStatus: string) => {
    return new Date(dueDate) < new Date() && paymentStatus !== 'paid';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Fatura Yönetimi
          </Typography>
          <Box>
            <Button
              startIcon={<FilterList />}
              onClick={() => setFiltersOpen(!filtersOpen)}
              sx={{ mr: 1 }}
            >
              Filtreler
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadInvoices}
              disabled={loading}
            >
              Yenile
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        {filtersOpen && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filtreler
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Arama"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Müşteri</InputLabel>
                    <Select
                      value={filters.contact_id || ''}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        contact_id: e.target.value ? Number(e.target.value) : undefined 
                      })}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {contacts.map((contact) => (
                        <MenuItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Ödeme Durumu</InputLabel>
                    <Select
                      value={filters.payment_status || ''}
                      onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      <MenuItem value="paid">Ödendi</MenuItem>
                      <MenuItem value="unpaid">Ödenmedi</MenuItem>
                      <MenuItem value="partial">Kısmi</MenuItem>
                      <MenuItem value="overdue">Vadesi Geçti</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Fatura Tarihi (Başlangıç)"
                    value={filters.issue_date_start}
                    onChange={(date) => setFilters({ ...filters, issue_date_start: date })}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        size: 'medium'
                      } 
                    }}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  onClick={() => setFilters({
                    search: '',
                    payment_status: '',
                    issue_date_start: null,
                    issue_date_end: null,
                    due_date_start: null,
                    due_date_end: null
                  })}
                  sx={{ mr: 1 }}
                >
                  Temizle
                </Button>
                <Button
                  variant="contained"
                  onClick={loadInvoices}
                >
                  Filtrele
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Invoice Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fatura No</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Fatura Tarihi</TableCell>
                  <TableCell>Vade Tarihi</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                  <TableCell align="right">Ödenen</TableCell>
                  <TableCell align="right">Kalan</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Fatura bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow 
                      key={invoice.id}
                      sx={{ 
                        backgroundColor: isOverdue(invoice.due_date, invoice.payment_status) 
                          ? 'error.light' 
                          : 'inherit' 
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {invoice.invoice_no}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {invoice.contact_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(invoice.issue_date)}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {formatDate(invoice.due_date)}
                          {isOverdue(invoice.due_date, invoice.payment_status) && (
                            <Warning color="error" fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(invoice.gross_total)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(invoice.total_paid)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(invoice.remaining)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.payment_status === 'paid' ? 'Ödendi' : 
                                invoice.payment_status === 'unpaid' ? 'Ödenmedi' :
                                invoice.payment_status === 'partial' ? 'Kısmi' : 'Vadesi Geçti'}
                          color={getPaymentStatusColor(invoice.payment_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Görüntüle">
                          <IconButton
                            size="small"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {invoice.payment_status !== 'paid' && (
                          <Tooltip title="Ödeme Kaydet">
                            <IconButton
                              size="small"
                              onClick={() => handlePaymentDialog(invoice)}
                            >
                              <Payment />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Sayfa başına satır:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}–${to} / ${count !== -1 ? count : `${to}'den fazla`}`
            }
          />
        </Card>

        {/* Invoice Detail Dialog */}
        <Dialog 
          open={detailOpen} 
          onClose={() => setDetailOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          {selectedInvoice && (
            <>
              <DialogTitle>
                Fatura Detayı - {selectedInvoice.invoice_no}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Fatura Bilgileri
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Fatura No"
                          secondary={selectedInvoice.invoice_no}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Müşteri"
                          secondary={selectedInvoice.contact_name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Fatura Tarihi"
                          secondary={formatDate(selectedInvoice.issue_date)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Vade Tarihi"
                          secondary={formatDate(selectedInvoice.due_date)}
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tutar Bilgileri
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Toplam Tutar"
                          secondary={formatCurrency(selectedInvoice.gross_total)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Ödenen Tutar"
                          secondary={formatCurrency(selectedInvoice.total_paid)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Kalan Tutar"
                          secondary={formatCurrency(selectedInvoice.remaining)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Durum"
                          secondary={
                            <Chip
                              label={selectedInvoice.payment_status === 'paid' ? 'Ödendi' : 
                                    selectedInvoice.payment_status === 'unpaid' ? 'Ödenmedi' :
                                    selectedInvoice.payment_status === 'partial' ? 'Kısmi' : 'Vadesi Geçti'}
                              color={getPaymentStatusColor(selectedInvoice.payment_status)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Fatura Kalemleri
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Ürün</TableCell>
                              <TableCell align="right">Miktar</TableCell>
                              <TableCell align="right">Birim Fiyat</TableCell>
                              <TableCell align="right">KDV (%)</TableCell>
                              <TableCell align="right">Toplam</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedInvoice.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="bold">
                                    {item.product_name}
                                  </Typography>
                                  {item.description && (
                                    <Typography variant="caption" color="text.secondary">
                                      {item.description}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(item.unit_price)}
                                </TableCell>
                                <TableCell align="right">
                                  {item.vat_rate}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(item.gross_total)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailOpen(false)}>
                  Kapat
                </Button>
                {selectedInvoice.payment_status !== 'paid' && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      setDetailOpen(false);
                      handlePaymentDialog(selectedInvoice);
                    }}
                  >
                    Ödeme Kaydet
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Payment Dialog */}
        <Dialog 
          open={paymentOpen} 
          onClose={() => setPaymentOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            Ödeme Kaydet - {selectedInvoice?.invoice_no}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Ödeme Tutarı"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              margin="normal"
              InputProps={{
                endAdornment: <InputAdornment position="end">₺</InputAdornment>
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Hesap</InputLabel>
              <Select
                value={paymentForm.account_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, account_id: e.target.value })}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Ödeme Tarihi"
              value={paymentForm.date}
              onChange={(date) => setPaymentForm({ ...paymentForm, date: date || new Date() })}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  margin: 'normal'
                } 
              }}
            />

            <TextField
              fullWidth
              label="Açıklama"
              multiline
              rows={3}
              value={paymentForm.description}
              onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentOpen(false)}>
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleRecordPayment}
              disabled={processing || !paymentForm.amount || !paymentForm.account_id}
            >
              {processing ? <CircularProgress size={20} /> : 'Ödeme Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};