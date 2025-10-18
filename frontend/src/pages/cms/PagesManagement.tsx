import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  Publish as PublishIcon,
  Schedule as ScheduleIcon,
  Unpublished as UnpublishIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';

interface CMSPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  template?: string;
  isPublic: boolean;
  showInMenu: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  scheduledFor?: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
  };
}

interface PageFormData {
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  template: string;
  isPublic: boolean;
  showInMenu: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  scheduledFor: string;
  parentId: number | null;
  password: string;
}

const PagesManagement: React.FC = () => {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form data
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    template: 'default',
    isPublic: true,
    showInMenu: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    scheduledFor: '',
    parentId: null,
    password: '',
  });

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  };

  useEffect(() => {
    fetchPages();
  }, [statusFilter]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await api.get('/api/cms/pages', { params });
      setPages(response.data.data.pages || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to fetch pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (page?: CMSPage) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        content: page.content,
        excerpt: page.excerpt || '',
        status: page.status,
        template: page.template || 'default',
        isPublic: page.isPublic,
        showInMenu: page.showInMenu,
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        metaKeywords: page.metaKeywords || '',
        scheduledFor: page.scheduledFor || '',
        parentId: page.parentId || null,
        password: '',
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        status: 'draft',
        template: 'default',
        isPublic: true,
        showInMenu: false,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        scheduledFor: '',
        parentId: null,
        password: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPage(null);
  };

  const handleSavePage = async () => {
    try {
      if (!formData.title || !formData.content) {
        showSnackbar('Title and content are required', 'error');
        return;
      }

      setLoading(true);
      const payload = {
        ...formData,
        parentId: formData.parentId || undefined,
        scheduledFor: formData.scheduledFor || undefined,
      };

      if (editingPage) {
        await api.put(`/api/cms/pages/${editingPage.id}`, payload);
        showSnackbar('Page updated successfully', 'success');
      } else {
        await api.post('/api/cms/pages', payload);
        showSnackbar('Page created successfully', 'success');
      }

      handleCloseDialog();
      fetchPages();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to save page', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      setLoading(true);
      await api.delete(`/api/cms/pages/${id}`);
      showSnackbar('Page deleted successfully', 'success');
      fetchPages();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete page', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishPage = async (id: number) => {
    try {
      setLoading(true);
      await api.post(`/api/cms/pages/${id}/publish`);
      showSnackbar('Page published successfully', 'success');
      fetchPages();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to publish page', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublishPage = async (id: number) => {
    try {
      setLoading(true);
      await api.post(`/api/cms/pages/${id}/unpublish`);
      showSnackbar('Page unpublished successfully', 'success');
      fetchPages();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to unpublish page', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicatePage = async (id: number) => {
    try {
      setLoading(true);
      await api.post(`/api/cms/pages/${id}/duplicate`);
      showSnackbar('Page duplicated successfully', 'success');
      fetchPages();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to duplicate page', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'scheduled': return 'info';
      case 'archived': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Pages Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Page
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="outlined" onClick={fetchPages}>
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No pages found
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {page.parentId && <FolderIcon fontSize="small" color="action" />}
                      {page.title}
                    </Box>
                  </TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell>
                    <Chip
                      label={page.status}
                      color={getStatusColor(page.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{page.author?.name || 'Unknown'}</TableCell>
                  <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(page)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {page.status === 'published' ? (
                      <Tooltip title="Unpublish">
                        <IconButton size="small" onClick={() => handleUnpublishPage(page.id)}>
                          <UnpublishIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Publish">
                        <IconButton size="small" onClick={() => handlePublishPage(page.id)}>
                          <PublishIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Duplicate">
                      <IconButton size="small" onClick={() => handleDuplicatePage(page.id)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeletePage(page.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
        <DialogContent>
          <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
            <Tab label="Content" />
            <Tab label="SEO" />
            <Tab label="Settings" />
          </Tabs>

          {/* Content Tab */}
          {currentTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                modules={quillModules}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </Box>
          )}

          {/* SEO Tab */}
          {currentTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Meta Title"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Meta Description"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Meta Keywords"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                helperText="Separate keywords with commas"
              />
            </Box>
          )}

          {/* Settings Tab */}
          {currentTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Template</InputLabel>
                <Select
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  label="Template"
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="landing">Landing Page</MenuItem>
                  <MenuItem value="full-width">Full Width</MenuItem>
                  <MenuItem value="sidebar">With Sidebar</MenuItem>
                </Select>
              </FormControl>
              {formData.status === 'scheduled' && (
                <TextField
                  fullWidth
                  label="Schedule For"
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Visibility</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    />
                    Public
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.showInMenu}
                      onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                    />
                    Show in Menu
                  </label>
                </Box>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePage} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editingPage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PagesManagement;
