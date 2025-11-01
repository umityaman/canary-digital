import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as InIcon,
  TrendingDown as OutIcon,
  SwapHoriz as TransferIcon,
  Edit as AdjustIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';
import axios from 'axios';
import { format } from 'date-fns';

interface StockMovement {
  id: number;
  movementType: string;
  movementReason: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
  createdAt: string;
  equipment: {
    id: number;
    name: string;
    serialNumber: string;
  };
  user: {
    id: number;
    name: string;
  };
  invoice?: {
    id: number;
    invoiceNumber: string;
  };
  deliveryNote?: {
    id: number;
    deliveryNoteNumber: string;
  };
}

interface Props {
  equipmentId?: number;
}

const StockMovementList: React.FC<Props> = ({ equipmentId }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    movementType: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  });

  useEffect(() => {
    fetchMovements();
  }, [page, rowsPerPage, filters, equipmentId]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage
      };

      if (filters.movementType) {
        params.movementType = filters.movementType;
      }
      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }
      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString();
      }

      const url = equipmentId 
        ? `${import.meta.env.VITE_API_URL}/stock/movements/${equipmentId}`
        : `${import.meta.env.VITE_API_URL}/stock/movements`;

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMovements(response.data.data);
      setTotal(response.data.total || response.data.data.length);
    } catch (error) {
      console.error('Failed to fetch movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <InIcon color="success" />;
      case 'out':
        return <OutIcon color="error" />;
      case 'transfer':
        return <TransferIcon color="info" />;
      case 'adjustment':
        return <AdjustIcon color="warning" />;
      default:
        return null;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'success';
      case 'out':
        return 'error';
      case 'transfer':
        return 'info';
      case 'adjustment':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'in':
        return 'Giriş';
      case 'out':
        return 'Çıkış';
      case 'transfer':
        return 'Transfer';
      case 'adjustment':
        return 'Düzeltme';
      default:
        return type;
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Hareket Tipi"
              value={filters.movementType}
              onChange={(e) => setFilters({ ...filters, movementType: e.target.value })}
              size="small"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="in">Giriş</MenuItem>
              <MenuItem value="out">Çıkış</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
              <MenuItem value="adjustment">Düzeltme</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
              <DatePicker
                label="Başlangıç Tarihi"
                value={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
              <DatePicker
                label="Bitiş Tarihi"
                value={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Tooltip title="Yenile">
              <IconButton onClick={fetchMovements} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              {!equipmentId && <TableCell>Ürün</TableCell>}
              <TableCell>Hareket Tipi</TableCell>
              <TableCell>Sebep</TableCell>
              <TableCell align="right">Miktar</TableCell>
              <TableCell align="right">Önceki Stok</TableCell>
              <TableCell align="right">Sonraki Stok</TableCell>
              <TableCell>Konum</TableCell>
              <TableCell>Kullanıcı</TableCell>
              <TableCell>İlişkili Belge</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={equipmentId ? 9 : 10} align="center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={equipmentId ? 9 : 10} align="center">
                  Hareket kaydı bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement) => (
                <TableRow key={movement.id} hover>
                  <TableCell>
                    {format(new Date(movement.createdAt), 'dd.MM.yyyy HH:mm')}
                  </TableCell>
                  {!equipmentId && (
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {movement.equipment.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        S/N: {movement.equipment.serialNumber}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      icon={getMovementIcon(movement.movementType)}
                      label={getMovementLabel(movement.movementType)}
                      color={getMovementColor(movement.movementType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{movement.movementReason}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={movement.movementType === 'in' ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {movement.movementType === 'in' ? '+' : '-'}
                      {Math.abs(movement.quantity)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{movement.stockBefore}</TableCell>
                  <TableCell align="right">
                    <strong>{movement.stockAfter}</strong>
                  </TableCell>
                  <TableCell>
                    {movement.fromLocation && (
                      <Typography variant="caption" display="block">
                        <strong>From:</strong> {movement.fromLocation}
                      </Typography>
                    )}
                    {movement.toLocation && (
                      <Typography variant="caption" display="block">
                        <strong>To:</strong> {movement.toLocation}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{movement.user.name}</TableCell>
                  <TableCell>
                    {movement.invoice && (
                      <Chip
                        label={`Fatura: ${movement.invoice.invoiceNumber}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {movement.deliveryNote && (
                      <Chip
                        label={`İrsaliye: ${movement.deliveryNote.deliveryNoteNumber}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </TableContainer>
    </Box>
  );
};

export default StockMovementList;
