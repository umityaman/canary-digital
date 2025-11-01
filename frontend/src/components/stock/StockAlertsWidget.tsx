import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

interface StockAlert {
  id: number;
  equipmentId: number;
  equipment: {
    id: number;
    name: string;
    serialNumber: string;
  };
  alertType: string;
  severity: string;
  message: string;
  currentStock: number;
  threshold: number;
  status: string;
  createdAt: string;
}

const StockAlertsWidget: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    fetchAlerts();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stock/alerts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/stock/alerts/${alertId}/acknowledge`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setDismissed([...dismissed, alertId]);
      fetchAlerts(); // Refresh alerts
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleDismiss = (alertId: number) => {
    setDismissed([...dismissed, alertId]);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon />;
      case 'high':
        return <WarningIcon />;
      case 'medium':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'info';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissed.includes(alert.id));

  if (loading) {
    return null;
  }

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <Box>
      {visibleAlerts.map((alert) => (
        <Collapse key={alert.id} in={true}>
          <Alert
            severity={getSeverityColor(alert.severity) as any}
            icon={getSeverityIcon(alert.severity)}
            sx={{ mb: 2 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={() => handleAcknowledge(alert.id)}
                >
                  Onayla
                </Button>
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => handleDismiss(alert.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          >
            <AlertTitle>
              <strong>{alert.equipment.name}</strong>
              {' - '}
              {alert.alertType === 'out_of_stock' ? 'Stok Tükendi' : 
               alert.alertType === 'low_stock' ? 'Düşük Stok' : 
               alert.alertType === 'overstock' ? 'Fazla Stok' : alert.alertType}
            </AlertTitle>
            {alert.message}
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Chip 
                label={`Mevcut: ${alert.currentStock}`} 
                size="small" 
                color={alert.currentStock === 0 ? 'error' : 'default'}
              />
              {alert.threshold && (
                <Chip 
                  label={`Eşik: ${alert.threshold}`} 
                  size="small" 
                  variant="outlined"
                />
              )}
              <Chip 
                label={`S/N: ${alert.equipment.serialNumber}`} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </Alert>
        </Collapse>
      ))}
    </Box>
  );
};

export default StockAlertsWidget;
