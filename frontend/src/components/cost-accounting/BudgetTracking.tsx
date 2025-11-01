import React, { useState, useEffect } from 'react';
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
  MenuItem,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';

interface BudgetItem {
  id: number;
  name: string;
  category: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: string;
  costCenter?: {
    name: string;
  };
}

interface BudgetSummary {
  totalPlanned: number;
  totalActual: number;
  totalVariance: number;
  totalVariancePercent: number;
  itemCount: number;
  overBudgetCount: number;
  underBudgetCount: number;
}

const BudgetTracking: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState<number | ''>('');
  const [quarter, setQuarter] = useState<number | ''>('');
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetData();
  }, [year, month, quarter]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const params: any = { year };
      if (month) params.month = month;
      if (quarter) params.quarter = quarter;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cost-accounting/reports/budget`,
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = response.data.data;
      setSummary(data.summary);
      setItems(data.items || []);
      setByCategory(data.byCategory || {});
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    if (variance < 0) return 'success'; // Under budget
    if (variance > 0) return 'error'; // Over budget
    return 'default';
  };

  const getProgressColor = (percent: number) => {
    if (percent <= 70) return 'success';
    if (percent <= 90) return 'warning';
    return 'error';
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Yıl"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              size="small"
            >
              {[2024, 2025, 2026].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Ay"
              value={month}
              onChange={(e) => setMonth(e.target.value ? parseInt(e.target.value) : '')}
              size="small"
            >
              <MenuItem value="">Tümü</MenuItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <MenuItem key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('tr-TR', { month: 'long' })}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Çeyrek"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value ? parseInt(e.target.value) : '')}
              size="small"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value={1}>Q1</MenuItem>
              <MenuItem value={2}>Q2</MenuItem>
              <MenuItem value={3}>Q3</MenuItem>
              <MenuItem value={4}>Q4</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Yenile">
              <IconButton onClick={fetchBudgetData} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Planlanan Toplam
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(summary.totalPlanned)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Gerçekleşen Toplam
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(summary.totalActual)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((summary.totalActual / summary.totalPlanned) * 100, 100)}
                    color={getProgressColor((summary.totalActual / summary.totalPlanned) * 100)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: summary.totalVariance > 0 ? 'error.light' : 'success.light' }}>
              <CardContent>
                <Typography variant="subtitle2" color="white" gutterBottom>
                  Varyans
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {summary.totalVariance > 0 ? (
                    <TrendingUpIcon sx={{ mr: 1, color: 'white' }} />
                  ) : (
                    <TrendingDownIcon sx={{ mr: 1, color: 'white' }} />
                  )}
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(Math.abs(summary.totalVariance))}
                  </Typography>
                </Box>
                <Typography variant="body2" color="white">
                  {summary.totalVariancePercent.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Bütçe Durumu
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={`Aşan: ${summary.overBudgetCount}`}
                    color="error"
                    size="small"
                  />
                  <Chip
                    label={`Normal: ${summary.underBudgetCount}`}
                    color="success"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Category Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Kategorilere Göre Bütçe
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(byCategory).map(([category, data]: [string, any]) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {category}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Planlanan:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(data.planned)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Gerçekleşen:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(data.actual)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Varyans:
                        </Typography>
                        <Chip
                          label={formatCurrency(Math.abs(data.variance))}
                          color={getVarianceColor(data.variance) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((data.actual / data.planned) * 100, 100)}
                      color={getProgressColor((data.actual / data.planned) * 100)}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Detailed Items Table */}
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Bütçe Kalemleri Detayı</Typography>
          <IconButton color="primary">
            <DownloadIcon />
          </IconButton>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kalem</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Maliyet Merkezi</TableCell>
                <TableCell align="right">Planlanan</TableCell>
                <TableCell align="right">Gerçekleşen</TableCell>
                <TableCell align="right">Varyans</TableCell>
                <TableCell align="center">Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Bütçe kalemi bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.costCenter?.name || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(item.plannedAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.actualAmount)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${formatCurrency(Math.abs(item.variance))} (${Math.abs(item.variancePercent).toFixed(1)}%)`}
                        color={getVarianceColor(item.variance) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((item.actualAmount / item.plannedAmount) * 100, 100)}
                        color={getProgressColor((item.actualAmount / item.plannedAmount) * 100)}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default BudgetTracking;
