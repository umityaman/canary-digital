import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
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
  ListItemIcon,
  Checkbox,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Description as DocumentIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  CreateNewFolder as NewFolderIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';

interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  folderId?: number;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

interface MediaFolder {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  _count?: { files: number; subfolders: number };
}

const MediaLibrary: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFile, setMenuFile] = useState<MediaFile | null>(null);

  const [fileFormData, setFileFormData] = useState({
    title: '',
    altText: '',
    caption: '',
    description: '',
    tags: '',
    isPublic: true,
  });

  const [folderFormData, setFolderFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: null as number | null,
  });

  useEffect(() => {
    fetchFiles();
    fetchFolders();
  }, [currentFolder, typeFilter]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (currentFolder !== null) {
        params.folderId = currentFolder;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

  const response = await api.get('/cms/media', { params });
      setFiles(response.data.data.files || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to fetch files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
  const response = await api.get('/cms/media/folders');
      setFolders(response.data.data.folders || []);
    } catch (error) {
      console.error('Failed to fetch folders', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const formData = new FormData();

    if (acceptedFiles.length === 1) {
      formData.append('file', acceptedFiles[0]);
      if (currentFolder) {
        formData.append('folderId', currentFolder.toString());
      }

      try {
        await api.post('/cms/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSnackbar('File uploaded successfully', 'success');
        fetchFiles();
      } catch (error: any) {
        showSnackbar(error.response?.data?.message || 'Failed to upload file', 'error');
      }
    } else {
      acceptedFiles.forEach(file => formData.append('files', file));
      if (currentFolder) {
        formData.append('folderId', currentFolder.toString());
      }

      try {
        await api.post('/cms/media/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSnackbar(`${acceptedFiles.length} files uploaded successfully`, 'success');
        fetchFiles();
      } catch (error: any) {
        showSnackbar(error.response?.data?.message || 'Failed to upload files', 'error');
      }
    }

    setUploading(false);
  }, [currentFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10485760, // 10MB
  });

  const handleOpenEditDialog = (file: MediaFile) => {
    setEditingFile(file);
    setFileFormData({
      title: file.title || '',
      altText: file.altText || '',
      caption: file.caption || '',
      description: file.description || '',
      tags: file.tags.join(', '),
      isPublic: file.isPublic,
    });
    setOpenEditDialog(true);
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;

    try {
      setLoading(true);
      const payload = {
        ...fileFormData,
        tags: fileFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      await api.put(`/cms/media/${editingFile.id}`, payload);
      showSnackbar('File updated successfully', 'success');
      setOpenEditDialog(false);
      fetchFiles();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to update file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      setLoading(true);
      await api.delete(`/cms/media/${id}`);
      showSnackbar('File deleted successfully', 'success');
      fetchFiles();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!window.confirm(`Delete ${selectedFiles.length} file(s)?`)) return;

    try {
      setLoading(true);
      await api.delete('/cms/media/bulk', {
        data: { mediaIds: selectedFiles },
      });
      showSnackbar('Files deleted successfully', 'success');
      setSelectedFiles([]);
      fetchFiles();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolderDialog = (folder?: MediaFolder) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderFormData({
        name: folder.name,
        slug: folder.slug,
        description: folder.description || '',
        parentId: folder.parentId || null,
      });
    } else {
      setEditingFolder(null);
      setFolderFormData({ name: '', slug: '', description: '', parentId: currentFolder });
    }
    setOpenFolderDialog(true);
  };

  const handleSaveFolder = async () => {
    try {
      if (!folderFormData.name) {
        showSnackbar('Folder name is required', 'error');
        return;
      }

      setLoading(true);
      if (editingFolder) {
        await api.put(`/cms/media/folders/${editingFolder.id}`, folderFormData);
        showSnackbar('Folder updated successfully', 'success');
      } else {
        await api.post('/cms/media/folders', folderFormData);
        showSnackbar('Folder created successfully', 'success');
      }

      setOpenFolderDialog(false);
      fetchFolders();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to save folder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (!window.confirm('Delete this folder and all its contents?')) return;

    try {
      setLoading(true);
      await api.delete(`/cms/media/folders/${id}`);
      showSnackbar('Folder deleted successfully', 'success');
      fetchFolders();
      if (currentFolder === id) setCurrentFolder(null);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete folder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (id: number) => {
    setSelectedFiles(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType.startsWith('video/')) return <VideoIcon />;
    if (mimeType.startsWith('audio/')) return <AudioIcon />;
    return <DocumentIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const currentFolderData = folders.find(f => f.id === currentFolder);
  const subfolders = folders.filter(f => f.parentId === currentFolder);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Media Library</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<NewFolderIcon />} onClick={() => handleOpenFolderDialog()}>
            New Folder
          </Button>
          {selectedFiles.length > 0 && (
            <Button variant="outlined" color="error" onClick={handleBulkDelete}>
              Delete ({selectedFiles.length})
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Folders</Typography>
              <List>
                <ListItem
                  button
                  selected={currentFolder === null}
                  onClick={() => setCurrentFolder(null)}
                >
                  <ListItemIcon><FolderIcon /></ListItemIcon>
                  <ListItemText primary="All Files" />
                </ListItem>
                {folders.filter(f => !f.parentId).map(folder => (
                  <ListItem
                    key={folder.id}
                    button
                    selected={currentFolder === folder.id}
                    onClick={() => setCurrentFolder(folder.id)}
                  >
                    <ListItemIcon>
                      {currentFolder === folder.id ? <FolderOpenIcon /> : <FolderIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={`${folder._count?.files || 0} files`}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth size="small">
                <InputLabel>Filter by Type</InputLabel>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Filter by Type">
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                  <MenuItem value="audio">Audio</MenuItem>
                  <MenuItem value="document">Documents</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Upload Zone */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s',
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">
                  {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Supported: Images, Videos, Audio, PDF, Documents (Max 10MB)
                </Typography>
                {uploading && <CircularProgress sx={{ mt: 2 }} />}
              </Box>
            </CardContent>
          </Card>

          {/* Breadcrumb */}
          {currentFolderData && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button size="small" onClick={() => setCurrentFolder(null)}>All Files</Button>
              <Typography>/</Typography>
              <Typography>{currentFolderData.name}</Typography>
            </Box>
          )}

          {/* Files Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* Subfolders */}
              {subfolders.map(folder => (
                <Grid item xs={6} sm={4} md={3} key={`folder-${folder.id}`}>
                  <Card
                    sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                    onClick={() => setCurrentFolder(folder.id)}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <FolderIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>{folder.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {folder._count?.files || 0} files
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Files */}
              {files.map(file => (
                <Grid item xs={6} sm={4} md={3} key={file.id}>
                  <Card sx={{ position: 'relative' }}>
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, bgcolor: 'white', borderRadius: 1 }}
                    />
                    {file.mimeType.startsWith('image/') ? (
                      <CardMedia
                        component="img"
                        height="140"
                        image={file.thumbnailUrl || file.url}
                        alt={file.altText || file.originalName}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                        {getFileIcon(file.mimeType)}
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="subtitle2" noWrap>{file.title || file.originalName}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <IconButton size="small" onClick={() => handleOpenEditDialog(file)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteFile(file.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {files.length === 0 && subfolders.length === 0 && (
                <Grid item xs={12}>
                  <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                    No files found
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Edit File Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit File Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={fileFormData.title}
            onChange={(e) => setFileFormData({ ...fileFormData, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Alt Text"
            value={fileFormData.altText}
            onChange={(e) => setFileFormData({ ...fileFormData, altText: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Caption"
            value={fileFormData.caption}
            onChange={(e) => setFileFormData({ ...fileFormData, caption: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={fileFormData.description}
            onChange={(e) => setFileFormData({ ...fileFormData, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={fileFormData.tags}
            onChange={(e) => setFileFormData({ ...fileFormData, tags: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveFile} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Folder Dialog */}
      <Dialog open={openFolderDialog} onClose={() => setOpenFolderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFolder ? 'Edit Folder' : 'New Folder'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={folderFormData.name}
            onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Slug"
            value={folderFormData.slug}
            onChange={(e) => setFolderFormData({ ...folderFormData, slug: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={folderFormData.description}
            onChange={(e) => setFolderFormData({ ...folderFormData, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveFolder} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editingFolder ? 'Update' : 'Create'}
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

export default MediaLibrary;
