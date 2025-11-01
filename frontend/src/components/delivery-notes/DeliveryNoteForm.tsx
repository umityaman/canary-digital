import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { deliveryNoteService, CreateDeliveryNoteDTO, DeliveryNoteItem } from '../../services/deliveryNoteService';

interface FormItem {
  equipmentId: number | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
}

export default function DeliveryNoteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    orderId: '',
    deliveryType: 'sevk',
    deliveryDate: new Date().toISOString().split('T')[0],
    carrierName: '',
    carrierPhone: '',
    vehiclePlate: '',
    driverName: '',
    driverPhone: '',
    transportMode: 'kara',
    shippingAddress: '',
    notes: ''
  });

  const [items, setItems] = useState<FormItem[]>([
    {
      equipmentId: null,
      description: '',
      quantity: 1,
      unit: 'Adet',
      unitPrice: 0,
      vatRate: 20
    }
  ]);

  useEffect(() => {
    fetchCustomers();
    fetchEquipment();
    if (isEditMode) {
      fetchDeliveryNote();
    }
  }, [id]);

  const fetchCustomers = async () => {
    try {
      // TODO: Replace with actual customer service
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (err) {
      console.error('Müşteriler yüklenemedi:', err);
    }
  };

  const fetchEquipment = async () => {
    try {
      // TODO: Replace with actual equipment service
      const response = await fetch('/api/equipment', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setEquipment(data.data || []);
    } catch (err) {
      console.error('Ekipmanlar yüklenemedi:', err);
    }
  };

  const fetchDeliveryNote = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const note = await deliveryNoteService.getById(parseInt(id));
      
      setFormData({
        customerId: note.customerId.toString(),
        orderId: note.orderId?.toString() || '',
        deliveryType: note.deliveryType,
        deliveryDate: note.deliveryDate.split('T')[0],
        carrierName: note.carrierName || '',
        carrierPhone: note.carrierPhone || '',
        vehiclePlate: note.vehiclePlate || '',
        driverName: note.driverName || '',
        driverPhone: note.driverPhone || '',
        transportMode: note.transportMode || 'kara',
        shippingAddress: note.shippingAddress || '',
        notes: note.notes || ''
      });

      setItems(note.items.map(item => ({
        equipmentId: item.equipmentId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate
      })));
    } catch (err: any) {
      setError(err.response?.data?.message || 'İrsaliye yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill from equipment
    if (field === 'equipmentId' && value) {
      const selectedEquipment = equipment.find(e => e.id === value);
      if (selectedEquipment) {
        newItems[index].description = selectedEquipment.name;
        newItems[index].unitPrice = selectedEquipment.price || 0;
      }
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      equipmentId: null,
      description: '',
      quantity: 1,
      unit: 'Adet',
      unitPrice: 0,
      vatRate: 20
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      alert('En az bir kalem olmalıdır');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item: FormItem) => {
    return item.quantity * item.unitPrice;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateVAT = () => {
    return items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item);
      return sum + (itemTotal * item.vatRate / 100);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.customerId) {
      setError('Müşteri seçmelisiniz');
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0)) {
      setError('Tüm kalemler için açıklama ve geçerli miktar girilmelidir');
      return;
    }

    const payload: CreateDeliveryNoteDTO = {
      customerId: parseInt(formData.customerId),
      orderId: formData.orderId ? parseInt(formData.orderId) : undefined,
      deliveryType: formData.deliveryType as 'sevk' | 'tahsilat',
      deliveryDate: formData.deliveryDate,
      carrierName: formData.carrierName || undefined,
      carrierPhone: formData.carrierPhone || undefined,
      vehiclePlate: formData.vehiclePlate || undefined,
      driverName: formData.driverName || undefined,
      driverPhone: formData.driverPhone || undefined,
      transportMode: formData.transportMode as any,
      shippingAddress: formData.shippingAddress || undefined,
      notes: formData.notes || undefined,
      items: items.map(item => ({
        equipmentId: item.equipmentId || undefined,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate
      }))
    };

    try {
      setLoading(true);
      if (isEditMode && id) {
        await deliveryNoteService.update(parseInt(id), payload);
        alert('İrsaliye güncellendi');
      } else {
        await deliveryNoteService.create(payload);
        alert('İrsaliye oluşturuldu');
      }
      navigate('/delivery-notes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'İşlem başarısız oldu');
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

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/delivery-notes')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditMode ? 'İrsaliye Düzenle' : 'Yeni İrsaliye'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Genel Bilgiler</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Müşteri"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Tip"
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleInputChange}
                >
                  <MenuItem value="sevk">Sevk</MenuItem>
                  <MenuItem value="tahsilat">Tahsilat</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Teslim Tarihi"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teslimat Adresi"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  multiline
                  rows={1}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Logistics Info */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Lojistik Bilgileri</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Taşıyıcı Firma"
                  name="carrierName"
                  value={formData.carrierName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Taşıyıcı Telefon"
                  name="carrierPhone"
                  value={formData.carrierPhone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Araç Plakası"
                  name="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sürücü Adı"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sürücü Telefon"
                  name="driverPhone"
                  value={formData.driverPhone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Taşıma Şekli"
                  name="transportMode"
                  value={formData.transportMode}
                  onChange={handleInputChange}
                >
                  <MenuItem value="kara">Kara Yolu</MenuItem>
                  <MenuItem value="hava">Hava Yolu</MenuItem>
                  <MenuItem value="deniz">Deniz Yolu</MenuItem>
                  <MenuItem value="demir">Demir Yolu</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notlar"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Items */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Kalemler</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                variant="outlined"
                size="small"
              >
                Kalem Ekle
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ekipman</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell width={80}>Miktar</TableCell>
                    <TableCell width={100}>Birim</TableCell>
                    <TableCell width={120}>Birim Fiyat</TableCell>
                    <TableCell width={80}>KDV %</TableCell>
                    <TableCell width={120}>Toplam</TableCell>
                    <TableCell width={60}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={item.equipmentId || ''}
                          onChange={(e) => handleItemChange(index, 'equipmentId', e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <MenuItem value="">Manuel</MenuItem>
                          {equipment.map(eq => (
                            <MenuItem key={eq.id} value={eq.id}>
                              {eq.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          required
                          size="small"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          required
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                          inputProps={{ min: 0.01, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        >
                          <MenuItem value="Adet">Adet</MenuItem>
                          <MenuItem value="Kg">Kg</MenuItem>
                          <MenuItem value="Lt">Lt</MenuItem>
                          <MenuItem value="M">M</MenuItem>
                          <MenuItem value="M2">M²</MenuItem>
                          <MenuItem value="M3">M³</MenuItem>
                          <MenuItem value="Paket">Paket</MenuItem>
                          <MenuItem value="Koli">Koli</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          size="small"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={item.vatRate}
                          onChange={(e) => handleItemChange(index, 'vatRate', parseFloat(e.target.value))}
                        >
                          <MenuItem value={0}>0</MenuItem>
                          <MenuItem value={1}>1</MenuItem>
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={20}>20</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(calculateItemTotal(item))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => removeItem(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals */}
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Box width={300}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Ara Toplam:</Typography>
                  <Typography>{formatCurrency(calculateSubtotal())}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>KDV:</Typography>
                  <Typography>{formatCurrency(calculateVAT())}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" borderTop={1} pt={1}>
                  <Typography variant="h6">Genel Toplam:</Typography>
                  <Typography variant="h6">{formatCurrency(calculateGrandTotal())}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/delivery-notes')}
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Güncelle' : 'Oluştur')}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
