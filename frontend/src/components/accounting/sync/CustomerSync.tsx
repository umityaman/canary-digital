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
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
  Tooltip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Search,
  Sync,
  CloudSync,
  Person,
  Business,
  Email,
  Phone,
  CheckCircle,
  Error,
  Warning,
  Schedule,
  SelectAll,
  PlayArrow,
  Pause,
  Refresh,
  Download,
  Upload
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/api';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  taxNumber: string;
  address: string;
  city: string;
  district: string;
  parasut_contact_id: number | null;
  sync_status: 'synced' | 'pending' | 'error' | 'never';
  last_sync: string | null;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

interface SyncProgress {
  current: number;
  total: number;
  isRunning: boolean;
  currentCustomer: string | null;
  errors: Array<{
    customerId: number;
    customerName: string;
    error: string;
  }>;
  completed: Array<{
    customerId: number;
    customerName: string;
    parasutContactId: number;
  }>;
}

interface SyncFilters {
  search: string;
  sync_status: string;
  company_filter: string;
}

const SYNC_STATUS_LABELS = {
  synced: 'Senkronize',
  pending: 'Bekliyor',
  error: 'Hata',
  never: 'Hiç'
};

const SYNC_STATUS_COLORS = {
  synced: 'success',
  pending: 'warning',
  error: 'error',
  never: 'default'
} as const;

export const CustomerSync: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState<SyncFilters>({
    search: '',
    sync_status: '',
    company_filter: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    synced: 0,
    pending: 0,
    errors: 0,
    never: 0
  });

  useEffect(() => {
    loadCustomers();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    calculateStats();
  }, [customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });

      // Add filters
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.sync_status) {
        params.append('sync_status', filters.sync_status);
      }
      if (filters.company_filter) {
        params.append('company', filters.company_filter);
      }

      const response = await apiClient.get(`/customers?${params}`);
      
      if (response.data.customers) {
        setCustomers(response.data.customers);
        setTotalCount(response.data.total || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Müşteriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = customers.reduce((acc, customer) => {
      acc.total++;
      switch (customer.sync_status) {
        case 'synced':
          acc.synced++;
          break;
        case 'pending':
          acc.pending++;
          break;
        case 'error':
          acc.errors++;
          break;
        case 'never':
          acc.never++;
          break;
      }
      return acc;
    }, { total: 0, synced: 0, pending: 0, errors: 0, never: 0 });

    setStats(stats);
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSyncSingle = async (customerId: number) => {
    try {
      setSyncProgress({
        current: 0,
        total: 1,
        isRunning: true,
        currentCustomer: customers.find(c => c.id === customerId)?.name || null,
        errors: [],
        completed: []
      });
      setProgressOpen(true);

      const response = await apiClient.post(`/parasut/customers/${customerId}/sync`);
      
      if (response.data.success) {
        setSyncProgress(prev => prev ? {
          ...prev,
          current: 1,
          isRunning: false,
          completed: [{
            customerId,
            customerName: customers.find(c => c.id === customerId)?.name || '',
            parasutContactId: response.data.parasut_contact_id
          }]
        } : null);
        
        await loadCustomers();
      } else {
        throw new Error(response.data.message || 'Senkronizasyon başarısız');
      }
    } catch (err: any) {
      setSyncProgress(prev => prev ? {
        ...prev,
        isRunning: false,
        errors: [{
          customerId,
          customerName: customers.find(c => c.id === customerId)?.name || '',
          error: err.response?.data?.message || err.message
        }]
      } : null);
    }
  };

  const handleBulkSync = async () => {
    if (selectedCustomers.length === 0) return;

    try {
      setSyncProgress({
        current: 0,
        total: selectedCustomers.length,
        isRunning: true,
        currentCustomer: null,
        errors: [],
        completed: []
      });
      setProgressOpen(true);

      // Sync customers one by one for better progress tracking
      const errors: any[] = [];
      const completed: any[] = [];

      for (let i = 0; i < selectedCustomers.length; i++) {
        const customerId = selectedCustomers[i];
        const customer = customers.find(c => c.id === customerId);
        
        setSyncProgress(prev => prev ? {
          ...prev,
          current: i,
          currentCustomer: customer?.name || null
        } : null);

        try {
          const response = await apiClient.post(`/parasut/customers/${customerId}/sync`);
          
          if (response.data.success) {
            completed.push({
              customerId,
              customerName: customer?.name || '',
              parasutContactId: response.data.parasut_contact_id
            });
          } else {
            errors.push({
              customerId,
              customerName: customer?.name || '',
              error: response.data.message || 'Senkronizasyon başarısız'
            });
          }
        } catch (err: any) {
          errors.push({
            customerId,
            customerName: customer?.name || '',
            error: err.response?.data?.message || err.message
          });
        }
      }

      setSyncProgress(prev => prev ? {
        ...prev,
        current: selectedCustomers.length,
        isRunning: false,
        currentCustomer: null,
        errors,
        completed
      } : null);

      setSelectedCustomers([]);
      await loadCustomers();

    } catch (err: any) {
      setError(err.response?.data?.message || 'Toplu senkronizasyon sırasında hata oluştu');
      setSyncProgress(prev => prev ? { ...prev, isRunning: false } : null);
    }
  };

  const handleBulkSyncAll = async () => {
    try {
      setSyncProgress({
        current: 0,
        total: stats.total,
        isRunning: true,
        currentCustomer: 'Tüm müşteriler senkronize ediliyor...',
        errors: [],
        completed: []
      });
      setProgressOpen(true);

      const response = await apiClient.post('/parasut/customers/bulk-sync');
      
      if (response.data.success) {
        setSyncProgress(prev => prev ? {
          ...prev,
          current: stats.total,
          isRunning: false,
          completed: response.data.results?.completed || [],
          errors: response.data.results?.errors || []
        } : null);
        
        await loadCustomers();
      } else {
        throw new Error(response.data.message || 'Toplu senkronizasyon başarısız');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Toplu senkronizasyon sırasında hata oluştu');
      setSyncProgress(prev => prev ? { ...prev, isRunning: false } : null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Hiç';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle color="success" />;
      case 'pending': return <Schedule color="warning" />;
      case 'error': return <Error color="error" />;
      case 'never': return <Warning color="disabled" />;
      default: return <Warning />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Müşteri Senkronizasyonu
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadCustomers}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudSync />}
            onClick={handleBulkSyncAll}
            disabled={loading || syncProgress?.isRunning}
          >
            Tümünü Senkronize Et
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Müşteri
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.synced}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Senkronize
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bekliyor
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats.errors}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hata
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">
                {stats.never}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiç Senkronize Edilmemiş
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Müşteri Ara"
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
              <TextField
                fullWidth
                select
                label="Senkronizasyon Durumu"
                value={filters.sync_status}
                onChange={(e) => setFilters({ ...filters, sync_status: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Tümü</option>
                <option value="synced">Senkronize</option>
                <option value="pending">Bekliyor</option>
                <option value="error">Hata</option>
                <option value="never">Hiç</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Şirket Filtresi"
                value={filters.company_filter}
                onChange={(e) => setFilters({ ...filters, company_filter: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={loadCustomers}
                disabled={loading}
              >
                Filtrele
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Actions */}
      {selectedCustomers.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body1">
                {selectedCustomers.length} müşteri seçildi
              </Typography>
              <Button
                variant="contained"
                startIcon={<Sync />}
                onClick={handleBulkSync}
                disabled={syncProgress?.isRunning}
              >
                Seçilenleri Senkronize Et
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Customer Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < customers.length}
                    checked={customers.length > 0 && selectedCustomers.length === customers.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Müşteri</TableCell>
                <TableCell>İletişim</TableCell>
                <TableCell>Şirket</TableCell>
                <TableCell>Senkronizasyon Durumu</TableCell>
                <TableCell>Son Senkronizasyon</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Müşteri bulunamadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {customer.name}
                          </Typography>
                          {customer.taxNumber && (
                            <Typography variant="caption" color="text.secondary">
                              Vergi No: {customer.taxNumber}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {customer.email && (
                          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                            <Email fontSize="small" />
                            <Typography variant="caption">
                              {customer.email}
                            </Typography>
                          </Box>
                        )}
                        {customer.phone && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Phone fontSize="small" />
                            <Typography variant="caption">
                              {customer.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {customer.company && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Business fontSize="small" />
                          <Typography variant="body2">
                            {customer.company}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getSyncStatusIcon(customer.sync_status)}
                        <Box>
                          <Chip
                            label={SYNC_STATUS_LABELS[customer.sync_status]}
                            color={SYNC_STATUS_COLORS[customer.sync_status]}
                            size="small"
                          />
                          {customer.sync_error && (
                            <Tooltip title={customer.sync_error}>
                              <Typography variant="caption" color="error" display="block">
                                Hata detayları
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(customer.last_sync)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Senkronize Et">
                        <IconButton
                          size="small"
                          onClick={() => handleSyncSingle(customer.id)}
                          disabled={syncProgress?.isRunning}
                        >
                          <Sync />
                        </IconButton>
                      </Tooltip>
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

      {/* Progress Dialog */}
      <Dialog 
        open={progressOpen} 
        onClose={() => !syncProgress?.isRunning && setProgressOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Senkronizasyon {syncProgress?.isRunning ? 'Devam Ediyor' : 'Tamamlandı'}
        </DialogTitle>
        <DialogContent>
          {syncProgress && (
            <Box>
              <LinearProgress 
                variant="determinate" 
                value={(syncProgress.current / syncProgress.total) * 100}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {syncProgress.current} / {syncProgress.total} tamamlandı
              </Typography>

              {syncProgress.currentCustomer && (
                <Typography variant="body2" gutterBottom>
                  Şu an işleniyor: {syncProgress.currentCustomer}
                </Typography>
              )}

              <Stepper orientation="vertical" sx={{ mt: 2 }}>
                {syncProgress.completed.length > 0 && (
                  <Step active>
                    <StepLabel icon={<CheckCircle color="success" />}>
                      Başarılı ({syncProgress.completed.length})
                    </StepLabel>
                    <StepContent>
                      <List dense>
                        {syncProgress.completed.slice(0, 5).map((item) => (
                          <ListItem key={item.customerId}>
                            <ListItemIcon>
                              <CheckCircle color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={item.customerName}
                              secondary={`Parasut ID: ${item.parasutContactId}`}
                            />
                          </ListItem>
                        ))}
                        {syncProgress.completed.length > 5 && (
                          <ListItem>
                            <ListItemText 
                              secondary={`+${syncProgress.completed.length - 5} daha...`}
                            />
                          </ListItem>
                        )}
                      </List>
                    </StepContent>
                  </Step>
                )}

                {syncProgress.errors.length > 0 && (
                  <Step active>
                    <StepLabel icon={<Error color="error" />}>
                      Hata ({syncProgress.errors.length})
                    </StepLabel>
                    <StepContent>
                      <List dense>
                        {syncProgress.errors.slice(0, 5).map((item) => (
                          <ListItem key={item.customerId}>
                            <ListItemIcon>
                              <Error color="error" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={item.customerName}
                              secondary={item.error}
                            />
                          </ListItem>
                        ))}
                        {syncProgress.errors.length > 5 && (
                          <ListItem>
                            <ListItemText 
                              secondary={`+${syncProgress.errors.length - 5} daha...`}
                            />
                          </ListItem>
                        )}
                      </List>
                    </StepContent>
                  </Step>
                )}
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setProgressOpen(false)}
            disabled={syncProgress?.isRunning}
          >
            {syncProgress?.isRunning ? 'Devam Ediyor...' : 'Kapat'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};