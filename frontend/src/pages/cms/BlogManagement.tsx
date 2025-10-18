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
  Autocomplete,
  Divider,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  PushPin as PinIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  isFeatured: boolean;
  isSticky: boolean;
  publishedAt?: string;
  category?: { id: number; name: string };
  tags?: Array<{ id: number; name: string }>;
  author?: { name: string };
  _count?: { comments: number };
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Comment {
  id: number;
  content: string;
  authorName?: string;
  authorEmail?: string;
  isApproved: boolean;
  createdAt: string;
  post?: { title: string };
}

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openCommentsDialog, setOpenCommentsDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [mainTab, setMainTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form data
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featuredImage: '',
    isFeatured: false,
    isSticky: false,
    categoryId: null as number | null,
    tags: [] as number[],
    metaTitle: '',
    metaDescription: '',
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: null as number | null,
  });

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, [statusFilter, categoryFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;
      const response = await api.get('/api/cms/blog/posts', { params });
      setPosts(response.data.data.posts || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to fetch posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/cms/blog/categories');
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/api/cms/blog/tags');
      setTags(response.data.data.tags || []);
    } catch (error) {
      console.error('Failed to fetch tags', error);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cms/blog/posts', { params: { page: 1, limit: 1000 } });
      const allPosts = response.data.data.posts || [];
      const allComments: Comment[] = [];
      // In a real app, you'd have a dedicated comments endpoint
      setComments(allComments);
    } catch (error) {
      showSnackbar('Failed to fetch comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPostDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setPostFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        status: post.status,
        featuredImage: post.featuredImage || '',
        isFeatured: post.isFeatured,
        isSticky: post.isSticky,
        categoryId: post.category?.id || null,
        tags: post.tags?.map(t => t.id) || [],
        metaTitle: '',
        metaDescription: '',
      });
    } else {
      setEditingPost(null);
      setPostFormData({
        title: '',
        content: '',
        excerpt: '',
        status: 'draft',
        featuredImage: '',
        isFeatured: false,
        isSticky: false,
        categoryId: null,
        tags: [],
        metaTitle: '',
        metaDescription: '',
      });
    }
    setOpenPostDialog(true);
  };

  const handleSavePost = async () => {
    try {
      if (!postFormData.title || !postFormData.content) {
        showSnackbar('Title and content are required', 'error');
        return;
      }

      setLoading(true);
      const payload = {
        ...postFormData,
        categoryId: postFormData.categoryId || undefined,
        tags: postFormData.tags.length > 0 ? postFormData.tags : undefined,
      };

      if (editingPost) {
        await api.put(`/api/cms/blog/posts/${editingPost.id}`, payload);
        showSnackbar('Post updated successfully', 'success');
      } else {
        await api.post('/api/cms/blog/posts', payload);
        showSnackbar('Post created successfully', 'success');
      }

      setOpenPostDialog(false);
      fetchPosts();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to save post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setLoading(true);
      await api.delete(`/api/cms/blog/posts/${id}`);
      showSnackbar('Post deleted successfully', 'success');
      fetchPosts();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || null,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', slug: '', description: '', parentId: null });
    }
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryFormData.name) {
        showSnackbar('Category name is required', 'error');
        return;
      }

      setLoading(true);
      if (editingCategory) {
        await api.put(`/api/cms/blog/categories/${editingCategory.id}`, categoryFormData);
        showSnackbar('Category updated successfully', 'success');
      } else {
        await api.post('/api/cms/blog/categories', categoryFormData);
        showSnackbar('Category created successfully', 'success');
      }

      setOpenCategoryDialog(false);
      fetchCategories();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      setLoading(true);
      await api.delete(`/api/cms/blog/categories/${id}`);
      showSnackbar('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveComment = async (id: number) => {
    try {
      await api.post(`/api/cms/blog/comments/${id}/approve`);
      showSnackbar('Comment approved', 'success');
      fetchComments();
    } catch (error: any) {
      showSnackbar('Failed to approve comment', 'error');
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await api.delete(`/api/cms/blog/comments/${id}`);
      showSnackbar('Comment deleted', 'success');
      fetchComments();
    } catch (error: any) {
      showSnackbar('Failed to delete comment', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'archived': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Blog Management</Typography>

      <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mb: 3 }}>
        <Tab label="Posts" />
        <Tab label="Categories" />
        <Tab label={<Badge badgeContent={comments.filter(c => !c.isApproved).length} color="error">Comments</Badge>} />
      </Tabs>

      {/* Posts Tab */}
      {mainTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="Category">
                  <MenuItem value="all">All</MenuItem>
                  {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenPostDialog()}>
              New Post
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Comments</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
                ) : posts.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">No posts found</TableCell></TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {post.isFeatured && <StarIcon fontSize="small" color="warning" />}
                          {post.isSticky && <PinIcon fontSize="small" color="primary" />}
                          {post.title}
                        </Box>
                      </TableCell>
                      <TableCell>{post.category?.name || '-'}</TableCell>
                      <TableCell>
                        <Chip label={post.status} color={getStatusColor(post.status)} size="small" />
                      </TableCell>
                      <TableCell>{post.author?.name || 'Unknown'}</TableCell>
                      <TableCell>{post._count?.comments || 0}</TableCell>
                      <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenPostDialog(post)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeletePost(post.id)} color="error">
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
        </>
      )}

      {/* Categories Tab */}
      {mainTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenCategoryDialog()}>
              New Category
            </Button>
          </Box>

          <Grid container spacing={3}>
            {categories.map(category => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="h6">{category.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{category.slug}</Typography>
                        {category.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>{category.description}</Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenCategoryDialog(category)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteCategory(category.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Comments Tab */}
      {mainTab === 2 && (
        <>
          <Button variant="outlined" onClick={fetchComments} sx={{ mb: 2 }}>Refresh Comments</Button>
          <List>
            {comments.map(comment => (
              <React.Fragment key={comment.id}>
                <ListItem
                  secondaryAction={
                    <>
                      {!comment.isApproved && (
                        <Button size="small" onClick={() => handleApproveComment(comment.id)}>Approve</Button>
                      )}
                      <IconButton edge="end" onClick={() => handleDeleteComment(comment.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={comment.content}
                    secondary={`By ${comment.authorName || 'Anonymous'} on ${comment.post?.title || 'Unknown Post'} - ${new Date(comment.createdAt).toLocaleString()}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {comments.length === 0 && <Typography align="center" sx={{ py: 4 }}>No comments yet</Typography>}
          </List>
        </>
      )}

      {/* Post Dialog */}
      <Dialog open={openPostDialog} onClose={() => setOpenPostDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingPost ? 'Edit Post' : 'New Post'}</DialogTitle>
        <DialogContent>
          <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
            <Tab label="Content" />
            <Tab label="Settings" />
          </Tabs>

          {currentTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={postFormData.title}
                onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Excerpt"
                value={postFormData.excerpt}
                onChange={(e) => setPostFormData({ ...postFormData, excerpt: e.target.value })}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
              <ReactQuill
                theme="snow"
                value={postFormData.content}
                onChange={(content) => setPostFormData({ ...postFormData, content })}
                modules={quillModules}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </Box>
          )}

          {currentTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select value={postFormData.status} onChange={(e) => setPostFormData({ ...postFormData, status: e.target.value as any })} label="Status">
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select value={postFormData.categoryId || ''} onChange={(e) => setPostFormData({ ...postFormData, categoryId: e.target.value as number })} label="Category">
                  <MenuItem value="">None</MenuItem>
                  {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={tags.filter(t => postFormData.tags.includes(t.id))}
                onChange={(_, newValue) => setPostFormData({ ...postFormData, tags: newValue.map(t => t.id) })}
                renderInput={(params) => <TextField {...params} label="Tags" />}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Featured Image URL"
                value={postFormData.featuredImage}
                onChange={(e) => setPostFormData({ ...postFormData, featuredImage: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <label>
                  <input type="checkbox" checked={postFormData.isFeatured} onChange={(e) => setPostFormData({ ...postFormData, isFeatured: e.target.checked })} />
                  Featured
                </label>
                <label>
                  <input type="checkbox" checked={postFormData.isSticky} onChange={(e) => setPostFormData({ ...postFormData, isSticky: e.target.checked })} />
                  Sticky
                </label>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPostDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePost} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editingPost ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={categoryFormData.name}
            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Slug"
            value={categoryFormData.slug}
            onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={categoryFormData.description}
            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editingCategory ? 'Update' : 'Create'}
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

export default BlogManagement;
