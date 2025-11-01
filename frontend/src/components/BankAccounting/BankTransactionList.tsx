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
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { apiClient } from '../../utils/api';
import { format } from 'date-fns';

interface BankTransaction {
  id: number;
  type: string;
  amount: number;
  description?: string;
  transactionType?: string;
  reference?: string;
  counterParty?: string;
  category?: string;
  balanceBefore: number;
  balanceAfter: number;
  date: string;
  isReconciled: boolean;
  status: string;
  expense?: {
    id: number;
    description: string;
    category: string;
  };
  invoice?: {
    id: number;
    invoiceNumber: string;
  };
}

interface TransactionFormData {
  accountId: number;
  type: string;
  amount: number;
  description: string;
  transactionType: string;
  reference: string;
  counterParty: string;
  counterPartyIBAN: string;
  category: string;
  date: string;
  notes: string;
}

const TRANSACTION_TYPES = [
  { value: 'deposit', label: 'Para Girişi' },
  { value: 'withdrawal', label: 'Para Çıkışı' }
];

const CATEGORIES = [
  { value: 'income', label: 'Gelir' },
  { value: 'expense', label: 'Gider' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'fee', label: 'Komisyon' },
  { value: 'interest', label: 'Faiz' },
  { value: 'other', label: 'Diğer' }
];

interface BankTransactionListProps {
  accountId: number;
}

const BankTransactionList: React.FC<BankTransactionListProps> = ({ accountId }) => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [formData, setFormData] = useState<TransactionFormData>({
    accountId,
    type: 'deposit',
    amount: 0,
    description: '',
    transactionType: '',
    reference: '',
    counterParty: '',
    counterPartyIBAN: '',
    category: 'income',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  useEffect(() => {
    loadTransactions();
  }, [accountId]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/bank-accounts/${accountId}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      accountId,
      type: 'deposit',
      amount: 0,
      description: '',
      transactionType: '',
      reference: '',
      counterParty: '',
      counterPartyIBAN: '',
      category: 'income',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await apiClient.post(`/bank-accounts/${accountId}/transactions`, formData);
      handleCloseDialog();
      loadTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleReconcile = async (transactionId: number) => {
    try {
      await apiClient.put(`/bank-accounts/transactions/${transactionId}/reconcile`);
      loadTransactions();
    } catch (error) {
      console.error('Error reconciling transaction:', error);
    }
  };

  const handleBulkReconcile = async () => {
    try {
      await apiClient.post('/bank-accounts/transactions/reconcile-bulk', {
        transactionIds: selectedTransactions
      });
      setSelectedTransactions([]);
      loadTransactions();
    } catch (error) {
      console.error('Error bulk reconciling:', error);
    }
  };

  const handleSelectTransaction = (id: number) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const formatCurrency = (amount: number) => {
    return `₺ ${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Banka Hareketleri
            </Typography>
            <Box>
              {selectedTransactions.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<CheckIcon />}
                  onClick={handleBulkReconcile}
                  sx={{ mr: 1 }}
                >
                  Seçilenleri Mutabık Et ({selectedTransactions.length})
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Yeni İşlem
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedTransactions.length === transactions.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTransactions(transactions.map(t => t.id));
                        } else {
                          setSelectedTransactions([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Karşı Taraf</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                  <TableCell align="right">Bakiye</TableCell>
                  <TableCell align="center">Mutabakat</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        disabled={transaction.isReconciled}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                      {transaction.reference && (
                        <Typography variant="caption" color="textSecondary">
                          Ref: {transaction.reference}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.category || '-'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {transaction.counterParty ? (
                        <Box>
                          <Typography variant="body2">
                            {transaction.counterParty}
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={transaction.type === 'deposit' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'deposit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(transaction.balanceAfter)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {transaction.isReconciled ? (
                        <Chip 
                          label="Mutabık" 
                          color="success" 
                          size="small"
                          icon={<CheckIcon />}
                        />
                      ) : (
                        <Chip 
                          label="Bekliyor" 
                          color="warning" 
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {!transaction.isReconciled && (
                        <Tooltip title="Mutabık Et">
                          <IconButton 
                            size="small"
                            onClick={() => handleReconcile(transaction.id)}
                            color="primary"
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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
        <DialogTitle>Yeni İşlem</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="İşlem Türü"
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
              >
                {TRANSACTION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Tutar"
                value={formData.amount}
                onChange={(e) => handleFormChange('amount', parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Kategori"
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Tarih"
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Karşı Taraf"
                value={formData.counterParty}
                onChange={(e) => handleFormChange('counterParty', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Karşı Taraf IBAN"
                value={formData.counterPartyIBAN}
                onChange={(e) => handleFormChange('counterPartyIBAN', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Referans No"
                value={formData.reference}
                onChange={(e) => handleFormChange('reference', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İşlem Tipi"
                value={formData.transactionType}
                onChange={(e) => handleFormChange('transactionType', e.target.value)}
                placeholder="EFT, Havale, Nakit..."
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
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankTransactionList;
