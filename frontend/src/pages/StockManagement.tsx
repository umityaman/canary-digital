import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import StockMovementList from '../components/stock/StockMovementList';
import StockTransferList from '../components/stock/StockTransferList';
import StockAlertsWidget from '../components/stock/StockAlertsWidget';
import StockSummary from '../components/stock/StockSummary';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stock-tabpanel-${index}`}
      aria-labelledby={`stock-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const StockManagement: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Stok Yönetimi
      </Typography>

      {/* Stock Alerts Banner */}
      <Box sx={{ mb: 3 }}>
        <StockAlertsWidget />
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="stock management tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Özet" />
          <Tab label="Stok Hareketleri" />
          <Tab label="Transferler" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <StockSummary />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <StockMovementList />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <StockTransferList />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StockManagement;
