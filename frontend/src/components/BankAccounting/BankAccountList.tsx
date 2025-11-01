import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as BankIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { apiClient } from '../../utils/api';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountType: string;
  iban: string;
  branch?: string;
  branchCode?: string;
  currency: string;
  balance: number;
  availableBalance: number;
  blockedBalance?: number;
  recentDeposits?: number;
  recentWithdrawals?: number;
  unreconciledCount?: number;
  transactionCount?: number;
  lastReconciled?: string;
  lastStatementDate?: string;
  isActive: boolean;
}

interface BankAccountFormData {
  bankName: string;
  accountNumber: string;
  accountType: string;
  iban: string;
  branch: string;
  branchCode: string;
  currency: string;
  balance: number;
  notes: string;
}

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Vadesiz Mevduat' },
  { value: 'savings', label: 'Vadeli Mevduat' },
  { value: 'credit', label: 'Kredi Hesabı' }
];

const CURRENCIES = [
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' }
];

const BankAccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BankAccountFormData>({
    bankName: '',
    accountNumber: '',
    accountType: 'checking',
    iban: '',
    branch: '',
    branchCode: '',
    currency: 'TRY',
    balance: 0,
    notes: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/bank-accounts/summary');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountType: 'checking',
      iban: '',
      branch: '',
      branchCode: '',
      currency: 'TRY',
      balance: 0,
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field: keyof BankAccountFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await apiClient.post('/bank-accounts', formData);
      handleCloseDialog();
      loadAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    const symbols: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    return `${symbols[currency] || ''} ${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Toplam Bakiye
              </Typography>
              <Typography variant="h4">
                {formatCurrency(getTotalBalance())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Aktif Hesap Sayısı
              </Typography>
              <Typography variant="h4">
                {accounts.filter(a => a.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Son 30 Gün Giriş
              </Typography>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h4" color="success.main">
                  {formatCurrency(accounts.reduce((sum, a) => sum + (a.recentDeposits || 0), 0))}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Son 30 Gün Çıkış
              </Typography>
              <Box display="flex" alignItems="center">
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h4" color="error.main">
                  {formatCurrency(accounts.reduce((sum, a) => sum + (a.recentWithdrawals || 0), 0))}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Accounts Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              <BankIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Banka Hesapları
            </Typography>
            <Box>
              <Tooltip title="Yenile">
                <IconButton onClick={loadAccounts} sx={{ mr: 1 }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Yeni Hesap
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Banka</TableCell>
                  <TableCell>Hesap No</TableCell>
                  <TableCell>IBAN</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell align="right">Bakiye</TableCell>
                  <TableCell align="right">Kullanılabilir</TableCell>
                  <TableCell align="center">Mutabakat</TableCell>
                  <TableCell align="center">İşlem Sayısı</TableCell>
                  <TableCell align="center">Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {account.bankName}
                      </Typography>
                      {account.branch && (
                        <Typography variant="caption" color="textSecondary">
                          {account.branch}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {account.iban}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ACCOUNT_TYPES.find(t => t.value === account.accountType)?.label || account.accountType}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(account.balance, account.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(account.availableBalance, account.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {account.unreconciledCount ? (
                        <Chip 
                          label={`${account.unreconciledCount} bekliyor`}
                          color="warning"
                          size="small"
                        />
                      ) : (
                        <Chip label="Uyumlu" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={account.transactionCount || 0}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={account.isActive ? 'Aktif' : 'Pasif'}
                        color={account.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Banka Hesabı</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Banka Adı"
                value={formData.bankName}
                onChange={(e) => handleFormChange('bankName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hesap Numarası"
                value={formData.accountNumber}
                onChange={(e) => handleFormChange('accountNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="IBAN"
                value={formData.iban}
                onChange={(e) => handleFormChange('iban', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Hesap Türü"
                value={formData.accountType}
                onChange={(e) => handleFormChange('accountType', e.target.value)}
              >
                {ACCOUNT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Para Birimi"
                value={formData.currency}
                onChange={(e) => handleFormChange('currency', e.target.value)}
              >
                {CURRENCIES.map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Şube"
                value={formData.branch}
                onChange={(e) => handleFormChange('branch', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Şube Kodu"
                value={formData.branchCode}
                onChange={(e) => handleFormChange('branchCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Başlangıç Bakiyesi"
                value={formData.balance}
                onChange={(e) => handleFormChange('balance', parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notlar"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankAccountList;
