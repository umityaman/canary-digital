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
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance,
  Receipt,
  TrendingUp,
  Sync,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Settings,
  Assessment,
  MonetizationOn,
  Business,
  Description,
  CloudSync,
  Timeline
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/api';

interface ParasutStatus {
  connected: boolean;
  company?: {
    name: string;
    tax_number: string;
    city: string;
  };
  message: string;
}

interface SyncStatus {
  customers: {
    total: number;
    synced: number;
    lastSync: string | null;
  };
  invoices: {
    total: number;
    processed: number;
    lastSync: string | null;
  };
  isRunning: boolean;
}

interface AccountingSummary {
  totalInvoices: number;
  totalRevenue: number;
  pendingPayments: number;
  overduAmount: number;
  recentInvoices: Array<{
    id: number;
    invoice_no: string;
    contact_name: string;
    gross_total: number;
    issue_date: string;
    due_date: string;
    status: string;
  }>;
}

interface Account {
  id: number;
  name: string;
  account_type: string;
  currency: string;
  balance: number;
}

export const AccountingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [parasutStatus, setParasutStatus] = useState<ParasutStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'person',
    contact_type: 'customer'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [statusRes, syncRes, accountsRes] = await Promise.allSettled([
        apiClient.get('/parasut/status'),
        apiClient.get('/parasut/sync/status'),
        apiClient.get('/parasut/accounts')
      ]);

      // Handle status
      if (statusRes.status === 'fulfilled') {
        setParasutStatus(statusRes.value.data);
      }

      // Handle sync status
      if (syncRes.status === 'fulfilled') {
        setSyncStatus(syncRes.value.data);
      }

      // Handle accounts
      if (accountsRes.status === 'fulfilled') {
        setAccounts(accountsRes.value.data.accounts || []);
      }

      // Load summary if connected
      if (statusRes.status === 'fulfilled' && statusRes.value.data.connected) {
        try {
          const summaryRes = await apiClient.get('/parasut/invoices?per_page=5');
          if (summaryRes.data.invoices) {
            setSummary({
              totalInvoices: summaryRes.data.meta?.total_count || 0,
              totalRevenue: summaryRes.data.invoices.reduce((sum: number, inv: any) => 
                sum + (inv.gross_total || 0), 0),
              pendingPayments: summaryRes.data.invoices.filter((inv: any) => 
                inv.payment_status !== 'paid').length,
              overduAmount: summaryRes.data.invoices
                .filter((inv: any) => new Date(inv.due_date) < new Date() && inv.payment_status !== 'paid')
                .reduce((sum: number, inv: any) => sum + (inv.gross_total || 0), 0),
              recentInvoices: summaryRes.data.invoices.slice(0, 5)
            });
          }
        } catch (summaryError) {
          console.error('Failed to load summary:', summaryError);
        }
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Dashboard verilerini yüklerken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await apiClient.post('/parasut/auth');
      
      if (response.data.success) {
        await loadDashboardData();
      } else {
        setError('Parasut kimlik doğrulaması başarısız');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kimlik doğrulaması sırasında hata oluştu');
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await apiClient.post('/parasut/customers/bulk-sync');
      
      if (response.data.success) {
        await loadDashboardData();
      } else {
        setError('Toplu senkronizasyon başarısız');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Senkronizasyon sırasında hata oluştu');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const response = await apiClient.post('/parasut/contacts', newCustomer);
      
      if (response.data.success) {
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          type: 'person',
          contact_type: 'customer'
        });
        setSettingsOpen(false);
        await loadDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Müşteri oluşturulurken hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'unpaid': return 'warning';
      case 'overdue': return 'error';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Muhasebe Yönetimi
        </Typography>
        <Box>
          <Tooltip title="Yenile">
            <IconButton onClick={loadDashboardData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ayarlar">
            <IconButton onClick={() => setSettingsOpen(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <AccountBalance color={parasutStatus?.connected ? 'success' : 'error'} />
              <Box>
                <Typography variant="h6">
                  Parasut Bağlantı Durumu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {parasutStatus?.message}
                </Typography>
                {parasutStatus?.company && (
                  <Typography variant="body2" color="text.secondary">
                    Şirket: {parasutStatus.company.name} - {parasutStatus.company.tax_number}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Chip
                label={parasutStatus?.connected ? 'Bağlı' : 'Bağlı Değil'}
                color={parasutStatus?.connected ? 'success' : 'error'}
                icon={parasutStatus?.connected ? <CheckCircle /> : <Error />}
              />
              {!parasutStatus?.connected && (
                <Button
                  variant="contained"
                  onClick={handleAuthenticate}
                  disabled={syncing}
                  startIcon={syncing ? <CircularProgress size={20} /> : <CloudSync />}
                  sx={{ ml: 2 }}
                >
                  Bağlan
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {parasutStatus?.connected && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Receipt color="primary" />
                    <Box>
                      <Typography variant="h6">
                        {summary?.totalInvoices || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Fatura
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <MonetizationOn color="success" />
                    <Box>
                      <Typography variant="h6">
                        {formatCurrency(summary?.totalRevenue || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Ciro
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Warning color="warning" />
                    <Box>
                      <Typography variant="h6">
                        {summary?.pendingPayments || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bekleyen Ödeme
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Error color="error" />
                    <Box>
                      <Typography variant="h6">
                        {formatCurrency(summary?.overduAmount || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vadesi Geçen
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sync Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Senkronizasyon Durumu
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleBulkSync}
                  disabled={syncing || syncStatus?.isRunning}
                  startIcon={syncing ? <CircularProgress size={20} /> : <Sync />}
                >
                  Tümünü Senkronize Et
                </Button>
              </Box>

              {syncStatus?.isRunning && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Senkronizasyon devam ediyor...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Müşteriler</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {syncStatus?.customers.synced || 0} / {syncStatus?.customers.total || 0} senkronize edildi
                  </Typography>
                  {syncStatus?.customers.lastSync && (
                    <Typography variant="caption" color="text.secondary">
                      Son: {formatDate(syncStatus.customers.lastSync)}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Faturalar</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {syncStatus?.invoices.processed || 0} / {syncStatus?.invoices.total || 0} işlendi
                  </Typography>
                  {syncStatus?.invoices.lastSync && (
                    <Typography variant="caption" color="text.secondary">
                      Son: {formatDate(syncStatus.invoices.lastSync)}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Son Faturalar
                  </Typography>
                  
                  {summary?.recentInvoices && summary.recentInvoices.length > 0 ? (
                    <List>
                      {summary.recentInvoices.map((invoice, index) => (
                        <React.Fragment key={invoice.id}>
                          <ListItem>
                            <ListItemIcon>
                              <Description />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${invoice.invoice_no} - ${invoice.contact_name}`}
                              secondary={`${formatDate(invoice.issue_date)} • Vade: ${formatDate(invoice.due_date)}`}
                            />
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="h6">
                                {formatCurrency(invoice.gross_total)}
                              </Typography>
                              <Chip
                                label={invoice.status}
                                color={getStatusColor(invoice.status)}
                                size="small"
                              />
                            </Box>
                          </ListItem>
                          {index < summary.recentInvoices.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Henüz fatura bulunmuyor
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Accounts */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hesaplar
                  </Typography>
                  
                  {accounts.length > 0 ? (
                    <List dense>
                      {accounts.slice(0, 5).map((account) => (
                        <ListItem key={account.id}>
                          <ListItemIcon>
                            <AccountBalance fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={account.name}
                            secondary={`${account.account_type} • ${account.currency}`}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(account.balance)}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Hesap bilgileri yüklenemedi
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Muhasebe Ayarları</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Yeni Müşteri Ekle
          </Typography>
          
          <TextField
            fullWidth
            label="Müşteri Adı"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Telefon"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Tip</InputLabel>
            <Select
              value={newCustomer.type}
              onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })}
            >
              <MenuItem value="person">Bireysel</MenuItem>
              <MenuItem value="company">Kurumsal</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Müşteri Tipi</InputLabel>
            <Select
              value={newCustomer.contact_type}
              onChange={(e) => setNewCustomer({ ...newCustomer, contact_type: e.target.value })}
            >
              <MenuItem value="customer">Müşteri</MenuItem>
              <MenuItem value="supplier">Tedarikçi</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            İptal
          </Button>
          <Button
            onClick={handleCreateCustomer}
            variant="contained"
            disabled={!newCustomer.name}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};