import React from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import ParasutIntegration from '../../components/Integrations/ParasutIntegration';
import ExcelImportExport from '../../components/Excel/ExcelImportExport';

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
      id={`integrations-tabpanel-${index}`}
      aria-labelledby={`integrations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Entegrasyonlar
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Dış sistemlerle otomatik veri senkronizasyonu ve toplu veri işlemleri
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="integrations tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Paraşüt" />
          <Tab label="Excel Import/Export" />
          <Tab label="API Ayarları" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <ParasutIntegration />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ExcelImportExport />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              API Ayarları
            </Typography>
            <Typography color="textSecondary">
              API yapılandırma ayarları yakında...
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Integrations;
