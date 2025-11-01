import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as ProfitIcon,
  TrendingDown as LossIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';
import axios from 'axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface ProfitLossData {
  period: {
    start: Date;
    end: Date;
  };
  revenue: {
    total: number;
    paid: number;
    outstanding: number;
  };
  expenses: {
    total: number;
    byCategory: Record<string, any>;
    byCostCenter: Record<string, any>;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  summary: {
    totalInvoices: number;
    totalExpenseItems: number;
    averageInvoiceValue: number;
    averageExpenseValue: number;
  };
}

const ProfitLossReport: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | null>(endOfMonth(new Date()));
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      alert('Lütfen tarih aralığı seçiniz');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cost-accounting/reports/profit-loss`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch P&L report:', error);
      alert('Rapor yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box>
      {/* Header with Date Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
              <DatePicker
                label="Başlangıç Tarihi"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
              <DatePicker
                label="Bitiş Tarihi"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Yenile">
                <IconButton onClick={fetchReport} color="primary" disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="İndir">
                <IconButton color="primary">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Yükleniyor...</Typography>
        </Paper>
      ) : !data ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Rapor görüntülemek için tarih aralığı seçiniz
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="white" gutterBottom>
                    Toplam Gelir
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(data.revenue.total)}
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                    Tahsil Edilen: {formatCurrency(data.revenue.paid)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="white" gutterBottom>
                    Toplam Gider
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(data.expenses.total)}
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                    {data.summary.totalExpenseItems} kalem
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: data.profit.gross > 0 ? 'info.light' : 'warning.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {data.profit.gross > 0 ? (
                      <ProfitIcon sx={{ mr: 1, color: 'white' }} />
                    ) : (
                      <LossIcon sx={{ mr: 1, color: 'white' }} />
                    )}
                    <Typography variant="subtitle2" color="white">
                      Brüt Kâr/Zarar
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(Math.abs(data.profit.gross))}
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                    Marj: {data.profit.margin.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: data.profit.net > 0 ? 'primary.main' : 'warning.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {data.profit.net > 0 ? (
                      <ProfitIcon sx={{ mr: 1, color: 'white' }} />
                    ) : (
                      <LossIcon sx={{ mr: 1, color: 'white' }} />
                    )}
                    <Typography variant="subtitle2" color="white">
                      Net Kâr/Zarar
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(Math.abs(data.profit.net))}
                  </Typography>
                  <Chip
                    label={data.profit.net > 0 ? 'Kâr' : 'Zarar'}
                    size="small"
                    sx={{ mt: 1, bgcolor: 'white', color: 'primary.main' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Breakdown */}
          <Grid container spacing={3}>
            {/* Expenses by Category */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Kategorilere Göre Giderler
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Kategori</TableCell>
                        <TableCell align="right">Tutar</TableCell>
                        <TableCell align="right">Adet</TableCell>
                        <TableCell align="right">Oran</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(data.expenses.byCategory).map(([category, info]: [string, any]) => (
                        <TableRow key={category}>
                          <TableCell>{category}</TableCell>
                          <TableCell align="right">{formatCurrency(info.total)}</TableCell>
                          <TableCell align="right">{info.count}</TableCell>
                          <TableCell align="right">
                            {((info.total / data.expenses.total) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Expenses by Cost Center */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Maliyet Merkezlerine Göre Giderler
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Maliyet Merkezi</TableCell>
                        <TableCell align="right">Tutar</TableCell>
                        <TableCell align="right">Adet</TableCell>
                        <TableCell align="right">Oran</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(data.expenses.byCostCenter).map(([center, info]: [string, any]) => (
                        <TableRow key={center}>
                          <TableCell>{center}</TableCell>
                          <TableCell align="right">{formatCurrency(info.total)}</TableCell>
                          <TableCell align="right">{info.count}</TableCell>
                          <TableCell align="right">
                            {((info.total / data.expenses.total) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ProfitLossReport;
