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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Menu as MenuIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface Menu {
  id: number;
  name: string;
  slug: string;
  location: 'primary' | 'footer' | 'sidebar' | 'mobile';
  isActive: boolean;
  items?: MenuItem[];
}

interface MenuItem {
  id: number;
  title: string;
  url?: string;
  type: 'custom' | 'page' | 'post' | 'category' | 'external';
  targetId?: number;
  icon?: string;
  cssClass?: string;
  target?: '_self' | '_blank';
  parentId?: number;
  order: number;
  children?: MenuItem[];
}

interface CMSPage {
  id: number;
  title: string;
  slug: string;
}

const MenuEditor: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [openMenuDialog, setOpenMenuDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [menuFormData, setMenuFormData] = useState({
    name: '',
    slug: '',
    location: 'primary' as 'primary' | 'footer' | 'sidebar' | 'mobile',
  });

  const [itemFormData, setItemFormData] = useState({
    title: '',
    url: '',
    type: 'custom' as 'custom' | 'page' | 'post' | 'category' | 'external',
    targetId: null as number | null,
    icon: '',
    cssClass: '',
    target: '_self' as '_self' | '_blank',
    parentId: null as number | null,
    order: 0,
  });

  useEffect(() => {
    fetchMenus();
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      fetchMenuDetails(selectedMenu.id);
    }
  }, [selectedMenu]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
  const response = await api.get('/cms/menus');
      setMenus(response.data.data.menus || []);
      if (response.data.data.menus.length > 0 && !selectedMenu) {
        setSelectedMenu(response.data.data.menus[0]);
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to fetch menus', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuDetails = async (id: number) => {
    try {
      const response = await api.get(`/cms/menus/${id}`);
      setSelectedMenu(response.data.data);
    } catch (error: any) {
      showSnackbar('Failed to fetch menu details', 'error');
    }
  };

  const fetchPages = async () => {
    try {
  const response = await api.get('/cms/pages', { params: { status: 'published', limit: 100 } });
      setPages(response.data.data.pages || []);
    } catch (error) {
      console.error('Failed to fetch pages', error);
    }
  };

  const handleOpenMenuDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuFormData({
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
      });
    } else {
      setEditingMenu(null);
      setMenuFormData({ name: '', slug: '', location: 'primary' });
    }
    setOpenMenuDialog(true);
  };

  const handleSaveMenu = async () => {
    try {
      if (!menuFormData.name) {
        showSnackbar('Menu name is required', 'error');
        return;
      }

      setLoading(true);
      if (editingMenu) {
        await api.put(`/cms/menus/${editingMenu.id}`, menuFormData);
        showSnackbar('Menu updated successfully', 'success');
      } else {
        const response = await api.post('/cms/menus', menuFormData);
        showSnackbar('Menu created successfully', 'success');
        setSelectedMenu(response.data.data);
      }

      setOpenMenuDialog(false);
      fetchMenus();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to save menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this menu?')) return;

    try {
      setLoading(true);
      await api.delete(`/cms/menus/${id}`);
      showSnackbar('Menu deleted successfully', 'success');
      setSelectedMenu(null);
      fetchMenus();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateMenu = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.post(`/cms/menus/${id}/duplicate`);
      showSnackbar('Menu duplicated successfully', 'success');
      setSelectedMenu(response.data.data);
      fetchMenus();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to duplicate menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenItemDialog = (item?: MenuItem, parentId?: number) => {
    if (item) {
      setEditingItem(item);
      setItemFormData({
        title: item.title,
        url: item.url || '',
        type: item.type,
        targetId: item.targetId || null,
        icon: item.icon || '',
        cssClass: item.cssClass || '',
        target: item.target || '_self',
        parentId: item.parentId || null,
        order: item.order,
      });
    } else {
      setEditingItem(null);
      setItemFormData({
        title: '',
        url: '',
        type: 'custom',
        targetId: null,
        icon: '',
        cssClass: '',
        target: '_self',
        parentId: parentId || null,
        order: selectedMenu?.items?.length || 0,
      });
    }
    setOpenItemDialog(true);
  };

  const handleSaveItem = async () => {
    try {
      if (!itemFormData.title) {
        showSnackbar('Item title is required', 'error');
        return;
      }
      if (!selectedMenu) return;

      setLoading(true);
      const payload = {
        ...itemFormData,
        targetId: itemFormData.targetId || undefined,
        parentId: itemFormData.parentId || undefined,
      };

      if (editingItem) {
        await api.put(`/cms/menus/items/${editingItem.id}`, payload);
        showSnackbar('Menu item updated successfully', 'success');
      } else {
        await api.post(`/cms/menus/${selectedMenu.id}/items`, payload);
        showSnackbar('Menu item added successfully', 'success');
      }

      setOpenItemDialog(false);
      fetchMenuDetails(selectedMenu.id);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to save menu item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Delete this menu item?')) return;
    if (!selectedMenu) return;

    try {
      setLoading(true);
      await api.delete(`/cms/menus/items/${itemId}`);
      showSnackbar('Menu item deleted successfully', 'success');
      fetchMenuDetails(selectedMenu.id);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete menu item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAddPages = async () => {
    if (!selectedMenu) return;
    const selectedPageIds = pages.slice(0, 5).map(p => p.id); // Example: add first 5 pages

    try {
      setLoading(true);
      await api.post(`/cms/menus/${selectedMenu.id}/items/bulk-add-pages`, {
        pageIds: selectedPageIds,
      });
      showSnackbar('Pages added to menu successfully', 'success');
      fetchMenuDetails(selectedMenu.id);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to add pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (itemId: number, direction: 'up' | 'down') => {
    if (!selectedMenu?.items) return;

    const items = [...selectedMenu.items];
    const index = items.findIndex(i => i.id === itemId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap items
    [items[index], items[newIndex]] = [items[newIndex], items[index]];

    // Create reorder payload
    const itemOrders = items.map((item, idx) => ({
      itemId: item.id,
      order: idx,
      parentId: item.parentId || undefined,
    }));

    try {
      setLoading(true);
      await api.post(`/cms/menus/${selectedMenu.id}/reorder`, { itemOrders });
      showSnackbar('Menu reordered successfully', 'success');
      fetchMenuDetails(selectedMenu.id);
    } catch (error: any) {
      showSnackbar('Failed to reorder menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const renderMenuItems = (items: MenuItem[] = [], depth: number = 0) => {
    return items
      .sort((a, b) => a.order - b.order)
      .map((item, index) => (
        <React.Fragment key={item.id}>
          <ListItem
            sx={{
              pl: 2 + depth * 4,
              bgcolor: depth > 0 ? 'grey.50' : 'white',
              borderLeft: depth > 0 ? '3px solid' : 'none',
              borderColor: 'primary.main',
            }}
          >
            <DragIcon sx={{ mr: 1, color: 'text.secondary', cursor: 'grab' }} />
            <ListItemText
              primary={item.title}
              secondary={`${item.type} ${item.url ? `→ ${item.url}` : ''}`}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {index > 0 && (
                <IconButton size="small" onClick={() => handleReorder(item.id, 'up')}>
                  <UpIcon fontSize="small" />
                </IconButton>
              )}
              {index < items.length - 1 && (
                <IconButton size="small" onClick={() => handleReorder(item.id, 'down')}>
                  <DownIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" onClick={() => handleOpenItemDialog(undefined, item.id)}>
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleOpenItemDialog(item)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteItem(item.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </ListItem>
          {item.children && item.children.length > 0 && renderMenuItems(item.children, depth + 1)}
        </React.Fragment>
      ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Menu Editor</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenMenuDialog()}>
          New Menu
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Menu List Sidebar */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Menus</Typography>
              <List>
                {menus.map(menu => (
                  <ListItem
                    key={menu.id}
                    button
                    selected={selectedMenu?.id === menu.id}
                    onClick={() => setSelectedMenu(menu)}
                    sx={{ mb: 1, borderRadius: 1 }}
                  >
                    <MenuIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary={menu.name}
                      secondary={menu.location}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Menu Editor Main Area */}
        <Grid item xs={12} md={9}>
          {selectedMenu ? (
            <>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5">{selectedMenu.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Location: {selectedMenu.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Menu">
                        <IconButton onClick={() => handleOpenMenuDialog(selectedMenu)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate Menu">
                        <IconButton onClick={() => handleDuplicateMenu(selectedMenu.id)}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Menu">
                        <IconButton onClick={() => handleDeleteMenu(selectedMenu.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Menu Items</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={handleBulkAddPages}>
                        Add Pages
                      </Button>
                      <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenItemDialog()}>
                        Add Item
                      </Button>
                    </Box>
                  </Box>

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Paper variant="outlined">
                      <List sx={{ p: 0 }}>
                        {selectedMenu.items && selectedMenu.items.length > 0 ? (
                          renderMenuItems(selectedMenu.items)
                        ) : (
                          <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                              No menu items yet. Click "Add Item" to get started.
                            </Typography>
                          </Box>
                        )}
                      </List>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <MenuIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No menu selected
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Select a menu from the sidebar or create a new one
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Menu Dialog */}
      <Dialog open={openMenuDialog} onClose={() => setOpenMenuDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMenu ? 'Edit Menu' : 'New Menu'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={menuFormData.name}
            onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Slug"
            value={menuFormData.slug}
            onChange={(e) => setMenuFormData({ ...menuFormData, slug: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={menuFormData.location}
              onChange={(e) => setMenuFormData({ ...menuFormData, location: e.target.value as any })}
              label="Location"
            >
              <MenuItem value="primary">Primary Navigation</MenuItem>
              <MenuItem value="footer">Footer Menu</MenuItem>
              <MenuItem value="sidebar">Sidebar Menu</MenuItem>
              <MenuItem value="mobile">Mobile Menu</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMenuDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveMenu} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editingMenu ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Menu Item' : 'New Menu Item'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={itemFormData.title}
            onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={itemFormData.type}
              onChange={(e) => setItemFormData({ ...itemFormData, type: e.target.value as any })}
              label="Type"
            >
              <MenuItem value="custom">Custom Link</MenuItem>
              <MenuItem value="page">Page</MenuItem>
              <MenuItem value="post">Blog Post</MenuItem>
              <MenuItem value="category">Category</MenuItem>
              <MenuItem value="external">External Link</MenuItem>
            </Select>
          </FormControl>

          {itemFormData.type === 'page' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Page</InputLabel>
              <Select
                value={itemFormData.targetId || ''}
                onChange={(e) => setItemFormData({ ...itemFormData, targetId: e.target.value as number })}
                label="Select Page"
              >
                {pages.map(page => (
                  <MenuItem key={page.id} value={page.id}>{page.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {(itemFormData.type === 'custom' || itemFormData.type === 'external') && (
            <TextField
              fullWidth
              label="URL"
              value={itemFormData.url}
              onChange={(e) => setItemFormData({ ...itemFormData, url: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            label="CSS Class"
            value={itemFormData.cssClass}
            onChange={(e) => setItemFormData({ ...itemFormData, cssClass: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Target</InputLabel>
            <Select
              value={itemFormData.target}
              onChange={(e) => setItemFormData({ ...itemFormData, target: e.target.value as any })}
              label="Target"
            >
              <MenuItem value="_self">Same Window</MenuItem>
              <MenuItem value="_blank">New Window</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuEditor;
