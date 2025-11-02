import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert
} from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccountIcon
} from '@mui/icons-material';
import axios from 'axios';

interface CostCenter {
  id: number;
  code: string;
  name: string;
  description?: string;
  parentId?: number;
  annualBudget?: number;
  quarterlyBudget?: number;
  monthlyBudget?: number;
  responsiblePerson?: string;
  totalExpenses: number;
  children: CostCenter[];
}

const CostCenterHierarchy: React.FC = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parentId: undefined as number | undefined,
    annualBudget: 0,
    quarterlyBudget: 0,
    monthlyBudget: 0,
    responsiblePerson: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCostCenters();
  }, []);

  const fetchCostCenters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cost-accounting/cost-centers/hierarchy`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setCostCenters(response.data.data);
    } catch (error) {
      console.error('Failed to fetch cost centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (!formData.code || !formData.name) {
        setError('Kod ve isim alanları zorunludur');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/cost-accounting/cost-centers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setFormOpen(false);
      setFormData({
        code: '',
        name: '',
        description: '',
        parentId: undefined,
        annualBudget: 0,
        quarterlyBudget: 0,
        monthlyBudget: 0,
        responsiblePerson: ''
      });
      fetchCostCenters();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Maliyet merkezi oluşturulamadı');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const renderTree = (nodes: CostCenter[]) => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        nodeId={node.id.toString()}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <AccountIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                {node.code} - {node.name}
              </Typography>
              {node.description && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {node.description}
                </Typography>
              )}
              {node.responsiblePerson && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Sorumlu: {node.responsiblePerson}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {node.annualBudget && (
                <Chip
                  label={`Yıllık Bütçe: ${formatCurrency(node.annualBudget)}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                label={`Toplam Gider: ${formatCurrency(node.totalExpenses)}`}
                size="small"
                color={node.totalExpenses > (node.annualBudget || 0) ? 'error' : 'success'}
              />
            </Box>
          </Box>
        }
      >
        {node.children.length > 0 && renderTree(node.children)}
      </TreeItem>
    ));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Maliyet Merkezi Hiyerarşisi</Typography>
        <Box>
          <IconButton onClick={fetchCostCenters} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Yeni Maliyet Merkezi
          </Button>
        </Box>
      </Box>

      {costCenters.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Henüz maliyet merkezi tanımlanmamış
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
            sx={{ mt: 2 }}
          >
            İlk Maliyet Merkezini Oluştur
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            {renderTree(costCenters)}
          </TreeView>
        </Paper>
      )}

      {/* Create Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Maliyet Merkezi</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kod"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Örn: MM-001"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="İsim"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sorumlu Kişi"
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Yıllık Bütçe"
                value={formData.annualBudget}
                onChange={(e) => setFormData({ ...formData, annualBudget: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: 1000 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Çeyrek Dönem Bütçesi"
                value={formData.quarterlyBudget}
                onChange={(e) => setFormData({ ...formData, quarterlyBudget: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: 1000 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Aylık Bütçe"
                value={formData.monthlyBudget}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: 1000 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CostCenterHierarchy;
