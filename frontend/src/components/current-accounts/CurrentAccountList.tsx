import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import currentAccountService, { AccountBalance, AccountSummary } from '../../services/currentAccountService';

export default function CurrentAccountList() {
  const navigate = useNavigate();
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balanceFilter, setBalanceFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [balanceFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (balanceFilter === 'positive') {
        filters.minBalance = 0.01;
      } else if (balanceFilter === 'negative') {
        filters.maxBalance = -0.01;
      } else if (balanceFilter === 'active') {
        filters.hasBalance = true;
      }

      const [balancesData, summaryData] = await Promise.all([
        currentAccountService.getAllBalances(filters),
        currentAccountService.getSummary()
      ]);

      setBalances(balancesData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'success';
    if (balance < 0) return 'error';
    return 'default';
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
      <Typography variant="h4" gutterBottom>
        Cari Hesap Kartları
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Toplam Alacak
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(summary.totalReceivables)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Toplam Borç
                    </Typography>
                    <Typography variant="h5" color="error.main">
                      {formatCurrency(summary.totalPayables)}
                    </Typography>
                  </Box>
                  <TrendingDownIcon color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Net Bakiye
                    </Typography>
                    <Typography 
                      variant="h5" 
                      color={summary.netBalance >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(summary.netBalance)}
                    </Typography>
                  </Box>
                  <BalanceIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Gecikmiş Alacak
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(summary.totalOverdue)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {summary.overdueAccounts} müşteri
                    </Typography>
                  </Box>
                  <WarningIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              select
              label="Bakiye Filtresi"
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
              sx={{ minWidth: 200 }}
              size="small"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="active">Bakiyesi Olan</MenuItem>
              <MenuItem value="positive">Alacaklı</MenuItem>
              <MenuItem value="negative">Borçlu</MenuItem>
            </TextField>

            <Typography variant="body2" color="textSecondary">
              Toplam: {balances.length} hesap
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Balances Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Müşteri</TableCell>
                <TableCell align="right">Toplam Borç</TableCell>
                <TableCell align="right">Toplam Alacak</TableCell>
                <TableCell align="right">Bakiye</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Son İşlem</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">Kayıt bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((balance) => (
                  <TableRow 
                    key={balance.customerId} 
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/current-accounts/${balance.customerId}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {balance.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Typography variant="body2" color="textSecondary">
                        {formatCurrency(balance.totalDebit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Typography variant="body2" color="textSecondary">
                        {formatCurrency(balance.totalCredit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatCurrency(Math.abs(balance.balance))}
                        color={getBalanceColor(balance.balance)}
                        size="small"
                      />
                      {balance.balance > 0 && (
                        <Typography variant="caption" display="block" color="success.main">
                          Alacak
                        </Typography>
                      )}
                      {balance.balance < 0 && (
                        <Typography variant="caption" display="block" color="error.main">
                          Borç
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2">
                        {formatDate(balance.lastTransactionDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/current-accounts/${balance.customerId}`);
                        }}
                      >
                        <span style={{ display: window.innerWidth < 768 ? 'none' : 'inline' }}>Detay</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
