import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';

interface StockSummaryData {
  totalItems: number;
  totalQuantity: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: Array<{
    category: string;
    count: number;
    totalQuantity: number;
  }>;
  equipment: Array<{
    id: number;
    name: string;
    serialNumber: string;
    quantity: number;
    category: string;
  }>;
}

const StockSummary: React.FC = () => {
  const [summary, setSummary] = useState<StockSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stock/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSummary(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stock summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!summary) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Stok verisi yüklenemedi</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Toplam Ürün</Typography>
              </Box>
              <Typography variant="h3">{summary.totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Toplam Miktar</Typography>
              </Box>
              <Typography variant="h3">{summary.totalQuantity}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 1, color: 'white' }} />
                <Typography variant="h6" color="white">Düşük Stok</Typography>
              </Box>
              <Typography variant="h3" color="white">{summary.lowStockItems}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 1, color: 'white' }} />
                <Typography variant="h6" color="white">Stok Tükendi</Typography>
              </Box>
              <Typography variant="h3" color="white">{summary.outOfStockItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Breakdown */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CategoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Kategorilere Göre Stok</Typography>
        </Box>
        <Grid container spacing={2}>
          {summary.categories.map((cat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {cat.category || 'Kategori Yok'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Ürün Sayısı:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {cat.count}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Miktar:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {cat.totalQuantity}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Low Stock Items */}
      {summary.equipment.filter(e => e.quantity <= 5).length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Düşük Stoklu Ürünler
          </Typography>
          <Grid container spacing={2}>
            {summary.equipment
              .filter(e => e.quantity <= 5)
              .map((equip) => (
                <Grid item xs={12} sm={6} md={4} key={equip.id}>
                  <Card variant="outlined" sx={{ bgcolor: equip.quantity === 0 ? 'error.light' : 'warning.light' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {equip.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        S/N: {equip.serialNumber}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={equip.category || 'Kategori Yok'} 
                          size="small" 
                          color="default"
                        />
                        <Typography 
                          variant="h6" 
                          color={equip.quantity === 0 ? 'error.dark' : 'warning.dark'}
                        >
                          {equip.quantity} adet
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default StockSummary;
