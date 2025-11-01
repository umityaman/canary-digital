import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { apiClient } from '../../utils/api';
import { format } from 'date-fns';

interface ReconciliationFormData {
  accountId: number;
  periodStart: string;
  periodEnd: string;
  bankBalance: number;
  notes: string;
}

interface ReconciliationResult {
  id: number;
  reconciliationNumber: string;
  bookBalance: number;
  bankBalance: number;
  difference: number;
  reconciledCount: number;
  unreconciledCount: number;
  status: string;
}

interface UnreconciledTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
}

const ReconciliationDashboard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [unreconciledTransactions, setUnreconciledTransactions] = useState<UnreconciledTransaction[]>([]);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
  const [formData, setFormData] = useState<ReconciliationFormData>({
    accountId: 0,
    periodStart: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    periodEnd: format(new Date(), 'yyyy-MM-dd'),
    bankBalance: 0,
    notes: ''
  });

  const steps = [
    'Hesap ve Dönem Seçimi',
    'Mutabakat Dışı İşlemler',
    'Banka Bakiyesi',
    'Sonuç'
  ];

  React.useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await apiClient.get('/bank-accounts/summary');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadUnreconciledTransactions = async () => {
    try {
      const response = await apiClient.get(
        `/bank-accounts/${formData.accountId}/unreconciled`,
        {
          params: {
            startDate: formData.periodStart,
            endDate: formData.periodEnd
          }
        }
      );
      setUnreconciledTransactions(response.data);
    } catch (error) {
      console.error('Error loading unreconciled transactions:', error);
    }
  };

  const handleStartReconciliation = () => {
    setDialogOpen(true);
    setActiveStep(0);
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      await loadUnreconciledTransactions();
    } else if (activeStep === 2) {
      await performReconciliation();
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setActiveStep(0);
    setReconciliationResult(null);
  };

  const performReconciliation = async () => {
    try {
      const response = await apiClient.post(
        `/bank-accounts/${formData.accountId}/reconcile`,
        {
          periodStart: formData.periodStart,
          periodEnd: formData.periodEnd,
          bankBalance: formData.bankBalance,
          notes: formData.notes
        }
      );
      setReconciliationResult(response.data);
    } catch (error) {
      console.error('Error performing reconciliation:', error);
    }
  };

  const handleFormChange = (field: keyof ReconciliationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return `₺ ${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Banka Hesabı"
                value={formData.accountId}
                onChange={(e) => handleFormChange('accountId', parseInt(e.target.value))}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.bankName} - {account.accountNumber}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Başlangıç Tarihi"
                value={formData.periodStart}
                onChange={(e) => handleFormChange('periodStart', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Bitiş Tarihi"
                value={formData.periodEnd}
                onChange={(e) => handleFormChange('periodEnd', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            {unreconciledTransactions.length > 0 ? (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {unreconciledTransactions.length} adet mutabakat dışı işlem bulundu. 
                  Bu işlemler mutabakat hesaplamasında dikkate alınacaktır.
                </Alert>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Açıklama</TableCell>
                        <TableCell>Tür</TableCell>
                        <TableCell align="right">Tutar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unreconciledTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.date), 'dd.MM.yyyy')}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.type === 'deposit' ? 'Giriş' : 'Çıkış'}
                              color={transaction.type === 'deposit' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Alert severity="success">
                Tüm işlemler mutabık! Herhangi bir uyuşmazlık bulunamadı.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Banka ekstrenizde görünen bakiyeyi giriniz. 
                Bu bakiye, defter bakiyesi ile karşılaştırılacaktır.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Banka Ekstresi Bakiyesi"
                value={formData.bankBalance}
                onChange={(e) => handleFormChange('bankBalance', parseFloat(e.target.value))}
                inputProps={{ step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notlar (Opsiyonel)"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Mutabakat hakkında notlar..."
              />
            </Grid>
          </Grid>
        );

      case 3:
        if (!reconciliationResult) return null;

        const isDifferenceZero = Math.abs(reconciliationResult.difference) < 0.01;

        return (
          <Box sx={{ mt: 2 }}>
            {isDifferenceZero ? (
              <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Mutabakat Başarılı!
                </Typography>
                <Typography>
                  Defter ve banka bakiyeleri uyumlu. Herhangi bir fark bulunmamaktadır.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Fark Tespit Edildi!
                </Typography>
                <Typography>
                  Defter ve banka bakiyeleri arasında {formatCurrency(Math.abs(reconciliationResult.difference))} fark bulunmaktadır.
                </Typography>
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Defter Bakiyesi
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(reconciliationResult.bookBalance)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Banka Bakiyesi
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(reconciliationResult.bankBalance)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Fark
                  </Typography>
                  <Typography variant="h5" color={isDifferenceZero ? 'success.main' : 'warning.main'}>
                    {formatCurrency(reconciliationResult.difference)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Mutabık İşlem
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {reconciliationResult.reconciledCount}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Bekleyen İşlem
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {reconciliationResult.unreconciledCount}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Mutabakat Numarası
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {reconciliationResult.reconciliationNumber}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Mutabakat İşlemleri
            </Typography>
            <Button
              variant="contained"
              startIcon={<StartIcon />}
              onClick={handleStartReconciliation}
            >
              Yeni Mutabakat Başlat
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Reconciliation Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Banka Mutabakatı</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          {activeStep < steps.length - 1 && (
            <>
              <Button onClick={handleClose}>İptal</Button>
              {activeStep > 0 && (
                <Button onClick={handleBack}>Geri</Button>
              )}
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={activeStep === 0 && !formData.accountId}
              >
                {activeStep === steps.length - 2 ? 'Mutabakat Yap' : 'İleri'}
              </Button>
            </>
          )}
          {activeStep === steps.length - 1 && (
            <Button onClick={handleClose} variant="contained">
              Kapat
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReconciliationDashboard;
