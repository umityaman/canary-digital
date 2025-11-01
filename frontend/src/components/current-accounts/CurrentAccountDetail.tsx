import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import currentAccountService, {
  AccountBalance,
  AgingReport,
  AccountTransaction,
  AccountStatement
} from '../../services/currentAccountService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CurrentAccountDetail() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [aging, setAging] = useState<AgingReport | null>(null);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [statement, setStatement] = useState<AccountStatement | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statement date range
  const [statementStart, setStatementStart] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [statementEnd, setStatementEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  const fetchData = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);

      const id = parseInt(customerId);
      const [balanceData, agingData, transactionsData] = await Promise.all([
        currentAccountService.getCustomerBalance(id),
        currentAccountService.getCustomerAgingReport(id),
        currentAccountService.getCustomerTransactions(id, { limit: 50 })
      ]);

      setBalance(balanceData);
      setAging(agingData);
      setTransactions(transactionsData.transactions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatement = async () => {
    if (!customerId) return;

    try {
      const id = parseInt(customerId);
      const statementData = await currentAccountService.getCustomerStatement(
        id,
        statementStart,
        statementEnd
      );
      setStatement(statementData);
    } catch (err: any) {
      alert('Ekstre oluşturulamadı: ' + (err.response?.data?.message || err.message));
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !balance) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Müşteri bulunamadı'}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/current-accounts')}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  // Aging chart data
  const agingChartData = aging ? {
    labels: ['0-30 Gün', '30-60 Gün', '60-90 Gün', '90+ Gün'],
    datasets: [{
      label: 'Tutar',
      data: [aging.current, aging.days30to60, aging.days60to90, aging.over90],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  } : null;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/current-accounts')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">{balance.customerName}</Typography>
      </Box>

      {/* Balance Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Toplam Borç
              </Typography>
              <Typography variant="h5">
                {formatCurrency(balance.totalDebit)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon fontSize="small" color="primary" />
                <Typography variant="caption" color="textSecondary" ml={0.5}>
                  Faturalar
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Toplam Alacak
              </Typography>
              <Typography variant="h5">
                {formatCurrency(balance.totalCredit)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingDownIcon fontSize="small" color="success" />
                <Typography variant="caption" color="textSecondary" ml={0.5}>
                  Ödemeler
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: balance.balance >= 0 ? 'success.light' : 'error.light' }}>
            <CardContent>
              <Typography variant="body2" gutterBottom>
                Net Bakiye
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(Math.abs(balance.balance))}
              </Typography>
              <Chip
                label={balance.balance >= 0 ? 'Alacak' : 'Borç'}
                size="small"
                color={balance.balance >= 0 ? 'success' : 'error'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="İşlem Geçmişi" />
          <Tab label="Yaşlandırma" />
          <Tab label="Ekstre" />
        </Tabs>

        {/* Transaction History Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Referans</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell align="right">Borç</TableCell>
                  <TableCell align="right">Alacak</TableCell>
                  <TableCell align="right">Bakiye</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">İşlem bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={`${transaction.type}-${transaction.id}`}>
                      <TableCell>{formatDateTime(transaction.date)}</TableCell>
                      <TableCell>
                        {transaction.type === 'invoice' ? (
                          <Chip icon={<ReceiptIcon />} label="Fatura" size="small" color="primary" />
                        ) : (
                          <Chip icon={<PaymentIcon />} label="Ödeme" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell>{transaction.referenceNumber}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell align="right">
                        {transaction.debit > 0 && formatCurrency(transaction.debit)}
                      </TableCell>
                      <TableCell align="right">
                        {transaction.credit > 0 && formatCurrency(transaction.credit)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={transaction.balance >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          {formatCurrency(transaction.balance)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Aging Tab */}
        <TabPanel value={tabValue} index={1}>
          {aging && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Yaşlandırma Dağılımı</Typography>
                    {agingChartData && (
                      <Bar
                        data={agingChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            title: { display: false }
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Yaşlandırma Detayı</Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>0-30 Gün (Güncel)</TableCell>
                          <TableCell align="right">
                            <Chip label={formatCurrency(aging.current)} color="success" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>30-60 Gün</TableCell>
                          <TableCell align="right">
                            <Chip label={formatCurrency(aging.days30to60)} color="warning" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>60-90 Gün</TableCell>
                          <TableCell align="right">
                            <Chip label={formatCurrency(aging.days60to90)} color="warning" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>90+ Gün</TableCell>
                          <TableCell align="right">
                            <Chip label={formatCurrency(aging.over90)} color="error" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Toplam Gecikmiş</strong></TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" color="error.main">
                              {formatCurrency(aging.totalOverdue)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Statement Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box mb={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <TextField
                  type="date"
                  label="Başlangıç"
                  value={statementStart}
                  onChange={(e) => setStatementStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item>
                <TextField
                  type="date"
                  label="Bitiş"
                  value={statementEnd}
                  onChange={(e) => setStatementEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={fetchStatement}
                  startIcon={<DownloadIcon />}
                >
                  Ekstre Oluştur
                </Button>
              </Grid>
            </Grid>
          </Box>

          {statement && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cari Hesap Ekstresi
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {formatDate(statement.periodStart)} - {formatDate(statement.periodEnd)}
                </Typography>

                <Box my={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Dönem Başı:</Typography>
                      <Typography variant="h6">{formatCurrency(statement.openingBalance)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Dönem Sonu:</Typography>
                      <Typography variant="h6">{formatCurrency(statement.closingBalance)}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell>İşlem</TableCell>
                        <TableCell align="right">Borç</TableCell>
                        <TableCell align="right">Alacak</TableCell>
                        <TableCell align="right">Bakiye</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statement.transactions.map((tx, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{formatDate(tx.date)}</TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell align="right">
                            {tx.debit > 0 && formatCurrency(tx.debit)}
                          </TableCell>
                          <TableCell align="right">
                            {tx.credit > 0 && formatCurrency(tx.credit)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(tx.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
}
