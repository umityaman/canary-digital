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
  Button,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CompleteIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import StockTransferForm from './StockTransferForm';

interface StockTransfer {
  id: number;
  transferNumber: string;
  equipmentId: number;
  equipment: {
    id: number;
    name: string;
    serialNumber: string;
  };
  quantity: number;
  fromLocation: string;
  toLocation: string;
  status: string;
  carrier?: string;
  trackingNumber?: string;
  vehiclePlate?: string;
  notes?: string;
  requestedBy: number;
  requestedByUser: {
    id: number;
    name: string;
  };
  createdAt: string;
  shippedAt?: string;
  completedAt?: string;
}

const StockTransferList: React.FC = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [page, rowsPerPage]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stock/transfers`, {
        params: {
          limit: rowsPerPage,
          offset: page * rowsPerPage
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setTransfers(response.data.data || []);
      setTotal(response.data.total || response.data.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTransfer = async (transferId: number) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/stock/transfers/${transferId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchTransfers();
    } catch (error) {
      console.error('Failed to complete transfer:', error);
      alert('Transfer tamamlanamadı');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_transit':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'in_transit':
        return 'Yolda';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal';
      default:
        return status;
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
      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setFormOpen(true)}
        >
          Yeni Transfer
        </Button>
        <Tooltip title="Yenile">
          <IconButton onClick={fetchTransfers} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transfer No</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Ürün</TableCell>
              <TableCell align="right">Miktar</TableCell>
              <TableCell>Kaynak</TableCell>
              <TableCell>Hedef</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Taşıyıcı</TableCell>
              <TableCell>Takip No</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : transfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Transfer kaydı bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              transfers.map((transfer) => (
                <TableRow key={transfer.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {transfer.transferNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {format(new Date(transfer.createdAt), 'dd.MM.yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {transfer.equipment.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      S/N: {transfer.equipment.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{transfer.quantity}</strong>
                  </TableCell>
                  <TableCell>{transfer.fromLocation}</TableCell>
                  <TableCell>{transfer.toLocation}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(transfer.status)}
                      color={getStatusColor(transfer.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transfer.carrier || '-'}</TableCell>
                  <TableCell>{transfer.trackingNumber || '-'}</TableCell>
                  <TableCell>
                    {(transfer.status === 'pending' || transfer.status === 'in_transit') && (
                      <Tooltip title="Transferi Tamamla">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleCompleteTransfer(transfer.id)}
                        >
                          <CompleteIcon />
                        </IconButton>
                      </Tooltip>
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

      {/* Transfer Form Dialog */}
      <StockTransferForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          fetchTransfers();
        }}
      />
    </Box>
  );
};

export default StockTransferList;
