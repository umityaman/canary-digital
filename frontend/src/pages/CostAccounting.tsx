import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import CostCenterHierarchy from '../components/cost-accounting/CostCenterHierarchy';
import BudgetTracking from '../components/cost-accounting/BudgetTracking';
import ProfitLossReport from '../components/cost-accounting/ProfitLossReport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const CostAccounting: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Maliyet Muhasebesi
      </Typography>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="cost accounting tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Maliyet Merkezleri" />
          <Tab label="Bütçe Takibi" />
          <Tab label="Kâr/Zarar Raporu" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <CostCenterHierarchy />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <BudgetTracking />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <ProfitLossReport />
      </TabPanel>
    </Box>
  );
};

export default CostAccounting;
