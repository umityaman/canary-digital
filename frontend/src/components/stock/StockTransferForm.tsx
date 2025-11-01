import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

interface Equipment {
  id: number;
  name: string;
  serialNumber: string;
  quantity: number;
  category: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipmentId?: number;
}

const StockTransferForm: React.FC<Props> = ({ open, onClose, onSuccess, equipmentId }) => {
  const [formData, setFormData] = useState({
    equipmentId: equipmentId || 0,
    quantity: 1,
    fromLocation: '',
    toLocation: '',
    carrier: '',
    trackingNumber: '',
    vehiclePlate: '',
    notes: ''
  });
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  useEffect(() => {
    if (open && !equipmentId) {
      fetchEquipment();
    }
  }, [open, equipmentId]);

  const fetchEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/equipment`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEquipment(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoadingEquipment(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      if (!formData.equipmentId) {
        setError('Lütfen ürün seçiniz');
        return;
      }

      if (!formData.fromLocation || !formData.toLocation) {
        setError('Lütfen kaynak ve hedef konumları belirtiniz');
        return;
      }

      if (formData.quantity <= 0) {
        setError('Miktar 0\'dan büyük olmalıdır');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/stock/transfers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Transfer oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      equipmentId: equipmentId || 0,
      quantity: 1,
      fromLocation: '',
      toLocation: '',
      carrier: '',
      trackingNumber: '',
      vehiclePlate: '',
      notes: ''
    });
    setSelectedEquipment(null);
    setError('');
    onClose();
  };

  const handleEquipmentChange = (_event: any, value: Equipment | null) => {
    setSelectedEquipment(value);
    if (value) {
      setFormData({ ...formData, equipmentId: value.id });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Yeni Stok Transferi</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {!equipmentId && (
            <Grid item xs={12}>
              <Autocomplete
                options={equipment}
                getOptionLabel={(option) => `${option.name} (S/N: ${option.serialNumber})`}
                loading={loadingEquipment}
                value={selectedEquipment}
                onChange={handleEquipmentChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ürün"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingEquipment ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              {selectedEquipment && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Mevcut Stok: {selectedEquipment.quantity} adet
                </Alert>
              )}
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Kaynak Konum"
              required
              value={formData.fromLocation}
              onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
              placeholder="Örn: Depo A - Raf 12"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hedef Konum"
              required
              value={formData.toLocation}
              onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
              placeholder="Örn: Depo B - Raf 5"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Miktar"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              inputProps={{ min: 1, max: selectedEquipment?.quantity || 999 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Taşıyıcı Firma"
              value={formData.carrier}
              onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
              placeholder="Örn: Aras Kargo"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Takip Numarası"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Araç Plakası"
              value={formData.vehiclePlate}
              onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
              placeholder="34 ABC 123"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notlar"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Transfer ile ilgili ek bilgiler..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Transfer Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockTransferForm;
