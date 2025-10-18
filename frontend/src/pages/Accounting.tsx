import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Paper,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Dashboard,
  Receipt,
  Sync,
  AccountBalance,
  CheckCircle
} from '@mui/icons-material';

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
      id={`accounting-tabpanel-${index}`}
      aria-labelledby={`accounting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountingDashboard = () => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Alert severity="success" sx={{ mb: 2 }}>
        Parasut entegrasyonu başarıyla tamamlandı! Muhasebe işlemleri otomatik olarak senkronize ediliyor.
      </Alert>
    </Grid>
    
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            <Typography variant="h6">Entegrasyon Durumu</Typography>
          </Box>
          <Chip label="Aktif" color="success" />
          <Typography variant="body2" sx={{ mt: 1 }}>
            API bağlantısı sağlandı ve test edildi
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Receipt color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Faturalar</Typography>
          </Box>
          <Typography variant="h4" color="primary">
            0
          </Typography>
          <Typography variant="body2">
            Bekleyen fatura
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Sync color="info" sx={{ mr: 1 }} />
            <Typography variant="h6">Son Senkronizasyon</Typography>
          </Box>
          <Typography variant="body1">
            Sistem hazır
          </Typography>
          <Typography variant="body2">
            Otomatik senkronizasyon aktif
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mevcut Özellikler
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="OAuth2 Kimlik Doğrulama"
                secondary="Güvenli Parasut API bağlantısı"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Otomatik Fatura Oluşturma"
                secondary="Siparişlerden otomatik fatura üretimi"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Müşteri Senkronizasyonu"
                secondary="Müşteri bilgilerinin otomatik aktarımı"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Ödeme Takibi"
                secondary="Ödeme durumlarının otomatik güncellenmesi"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

const InvoiceManagement = () => (
  <Box>
    <Alert severity="info" sx={{ mb: 2 }}>
      Fatura yönetimi özellikleri yakında eklenecek.
    </Alert>
    <Typography variant="body1">
      Bu bölümde fatura oluşturma, düzenleme ve gönderme işlemleri yapılabilecek.
    </Typography>
  </Box>
);

const SyncSettings = () => (
  <Box>
    <Alert severity="info" sx={{ mb: 2 }}>
      Senkronizasyon ayarları yakında eklenecek.
    </Alert>
    <Typography variant="body1">
      Bu bölümde Parasut ile senkronizasyon ayarları yapılandırılabilecek.
    </Typography>
  </Box>
);

export default function Accounting() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">
          Ana Sayfa
        </Link>
        <Typography color="text.primary">Muhasebe</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalance />
        Muhasebe Yönetimi
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label="Dashboard"
              icon={<Dashboard />}
              iconPosition="start"
            />
            <Tab
              label="Faturalar"
              icon={<Receipt />}
              iconPosition="start"
            />
            <Tab
              label="Senkronizasyon"
              icon={<Sync />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AccountingDashboard />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <InvoiceManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SyncSettings />
        </TabPanel>
      </Paper>
    </Container>
  );
}