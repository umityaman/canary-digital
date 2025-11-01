import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import BankAccountList from '../../components/BankAccounting/BankAccountList';
import BankTransactionList from '../../components/BankAccounting/BankTransactionList';
import ReconciliationDashboard from '../../components/BankAccounting/ReconciliationDashboard';

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
      id={`bank-accounting-tabpanel-${index}`}
      aria-labelledby={`bank-accounting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const BankAccounting: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Banka Hesap Takibi
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Banka hesaplarınızı yönetin, işlemleri takip edin ve mutabakat yapın
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="bank accounting tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Hesaplar" />
          <Tab label="İşlemler" disabled={!selectedAccountId} />
          <Tab label="Mutabakat" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <BankAccountList />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {selectedAccountId && <BankTransactionList accountId={selectedAccountId} />}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ReconciliationDashboard />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default BankAccounting;
