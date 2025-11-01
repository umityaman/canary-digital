import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  CloudDone as CloudIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { apiClient } from '../../utils/api';

interface SyncStatus {
  customers: {
    total: number;
    synced: number;
    pending: number;
    percentage: number;
  };
  invoices: {
    total: number;
    synced: number;
    pending: number;
    percentage: number;
  };
  payments: {
    total: number;
  };
  isConfigured: boolean;
  lastSyncAt: string;
}

interface BulkSyncResult {
  customers: number;
  invoices: number;
  payments: number;
  errors: string[];
}

const ParasutIntegration: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<BulkSyncResult | null>(null);

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/parasut/sync/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Error loading sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSync = async () => {
    try {
      setSyncing(true);
      const response = await apiClient.post('/parasut/sync/bulk');
      setSyncResult(response.data.results);
      setDialogOpen(true);
      await loadSyncStatus();
    } catch (error) {
      console.error('Error performing bulk sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSyncResult(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!status?.isConfigured) {
    return (
      <Box>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            Paraşüt Entegrasyonu Yapılandırılmamış
          </Typography>
          <Typography>
            Paraşüt API bilgilerinizi ortam değişkenlerinde yapılandırmanız gerekiyor.
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="PARASUT_CLIENT_ID" />
            </ListItem>
            <ListItem>
              <ListItemText primary="PARASUT_CLIENT_SECRET" />
            </ListItem>
            <ListItem>
              <ListItemText primary="PARASUT_USERNAME" />
            </ListItem>
            <ListItem>
              <ListItemText primary="PARASUT_PASSWORD" />
            </ListItem>
            <ListItem>
              <ListItemText primary="PARASUT_COMPANY_ID" />
            </ListItem>
          </List>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <CloudIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5">
                      Paraşüt Entegrasyonu
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Otomatik muhasebe senkronizasyonu
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={loadSyncStatus}
                    sx={{ mr: 1 }}
                  >
                    Yenile
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                    onClick={handleBulkSync}
                    disabled={syncing}
                  >
                    {syncing ? 'Senkronize Ediliyor...' : 'Toplu Senkronizasyon'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customers Sync Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Müşteriler
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Senkronize: {status.customers.synced} / {status.customers.total}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    %{status.customers.percentage}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={status.customers.percentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={`${status.customers.synced} Senkronize`}
                  color="success"
                  size="small"
                  icon={<CheckIcon />}
                />
                <Chip 
                  label={`${status.customers.pending} Bekliyor`}
                  color="warning"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoices Sync Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Faturalar
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Senkronize: {status.invoices.synced} / {status.invoices.total}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    %{status.invoices.percentage}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={status.invoices.percentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={`${status.invoices.synced} Senkronize`}
                  color="success"
                  size="small"
                  icon={<CheckIcon />}
                />
                <Chip 
                  label={`${status.invoices.pending} Bekliyor`}
                  color="warning"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payments Sync Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ödemeler
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" color="primary">
                  {status.payments.total}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Toplam ödeme kaydı
                </Typography>
              </Box>
              <Chip 
                label="Otomatik Senkronizasyon"
                color="primary"
                size="small"
                icon={<SyncIcon />}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Information Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nasıl Çalışır?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    1. Otomatik Müşteri Senkronizasyonu
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Yeni müşteriler oluşturulduğunda otomatik olarak Paraşüt'e aktarılır.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    2. Fatura Entegrasyonu
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Oluşturulan faturalar Paraşüt'te e-Fatura veya e-Arşiv olarak kaydedilir.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    3. Ödeme Takibi
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Ödemeler otomatik olarak ilgili faturalara eşleştirilir.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Sync Result Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Senkronizasyon Tamamlandı
        </DialogTitle>
        <DialogContent>
          {syncResult && (
            <Box>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Müşteriler"
                    secondary={`${syncResult.customers} müşteri senkronize edildi`}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={syncResult.customers}
                      color="success"
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Faturalar"
                    secondary={`${syncResult.invoices} fatura senkronize edildi`}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={syncResult.invoices}
                      color="success"
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Ödemeler"
                    secondary={`${syncResult.payments} ödeme senkronize edildi`}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={syncResult.payments}
                      color="success"
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              {syncResult.errors.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Hatalar ({syncResult.errors.length})
                  </Typography>
                  <List dense>
                    {syncResult.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={error}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParasutIntegration;
