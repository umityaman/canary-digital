import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  VideoLibrary as TikTokIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Image as ImageIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SocialAccount {
  id: number;
  platform: string;
  accountName: string;
  username: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isActive: boolean;
  lastSyncAt?: string;
}

interface Post {
  id: number;
  platform: string;
  content: string;
  mediaUrls?: string;
  status: string;
  publishedAt?: string;
  scheduledFor?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  account: {
    accountName: string;
    username: string;
    avatarUrl?: string;
  };
}

const SocialMedia: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectDialog, setConnectDialog] = useState(false);
  const [postDialog, setPostDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [postContent, setPostContent] = useState({
    accountId: 0,
    content: '',
    mediaUrls: [] as string[],
    hashtags: [] as string[],
    scheduledFor: '',
  });

  const platformIcons: { [key: string]: React.ReactElement } = {
    instagram: <InstagramIcon />,
    facebook: <FacebookIcon />,
    twitter: <TwitterIcon />,
    linkedin: <LinkedInIcon />,
    tiktok: <TikTokIcon />,
  };

  const platformColors: { [key: string]: string } = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    tiktok: '#000000',
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social-media/dashboard');
      if (response.data.success) {
        setAccounts(response.data.data.accounts);
        setPosts(response.data.data.recentPosts);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlatform = async (platform: string) => {
    try {
      // Get OAuth URL
      const response = await api.get(`/social-media/oauth/${platform}`);
      if (response.data.success) {
        // Open OAuth URL in popup
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          response.data.data.oauthUrl,
          'Social Media Auth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for callback
        window.addEventListener('message', async (event) => {
          if (event.data.type === 'social-auth-callback') {
            const { platform, code } = event.data;
            if (popup) popup.close();

            // Connect account
            const connectResponse = await api.post('/social-media/accounts/connect', {
              platform,
              authCode: code,
            });

            if (connectResponse.data.success) {
              alert(`${platform} account connected successfully!`);
              fetchDashboard();
            }
          }
        });
      }
    } catch (error: any) {
      console.error('Error connecting platform:', error);
      alert(error.response?.data?.message || 'Failed to connect platform');
    } finally {
      setConnectDialog(false);
    }
  };

  const handleDisconnect = async (accountId: number) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      const response = await api.delete(`/social-media/accounts/${accountId}`);
      if (response.data.success) {
        alert('Account disconnected successfully');
        fetchDashboard();
      }
    } catch (error: any) {
      console.error('Error disconnecting account:', error);
      alert(error.response?.data?.message || 'Failed to disconnect account');
    }
  };

  const handleRefresh = async (accountId: number) => {
    try {
      const response = await api.post(`/social-media/accounts/${accountId}/refresh`);
      if (response.data.success) {
        alert('Account statistics refreshed');
        fetchDashboard();
      }
    } catch (error: any) {
      console.error('Error refreshing account:', error);
      alert(error.response?.data?.message || 'Failed to refresh account');
    }
  };

  const handlePublishPost = async () => {
    try {
      const response = await api.post('/social-media/posts', postContent);
      if (response.data.success) {
        alert(
          postContent.scheduledFor
            ? 'Post scheduled successfully!'
            : 'Post published successfully!'
        );
        setPostDialog(false);
        setPostContent({
          accountId: 0,
          content: '',
          mediaUrls: [],
          hashtags: [],
          scheduledFor: '',
        });
        fetchDashboard();
      }
    } catch (error: any) {
      console.error('Error publishing post:', error);
      alert(error.response?.data?.message || 'Failed to publish post');
    }
  };

  const summary = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((a) => a.isActive).length,
    totalFollowers: accounts.reduce((sum, a) => sum + a.followersCount, 0),
    totalPosts: accounts.reduce((sum, a) => sum + a.postsCount, 0),
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Social Media Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboard}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setConnectDialog(true)}
          >
            Connect Account
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Accounts
              </Typography>
              <Typography variant="h3">{summary.totalAccounts}</Typography>
              <Typography variant="body2" color="success.main">
                {summary.activeAccounts} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Followers
              </Typography>
              <Typography variant="h3">{summary.totalFollowers.toLocaleString()}</Typography>
              <TrendingUpIcon color="success" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Posts
              </Typography>
              <Typography variant="h3">{summary.totalPosts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography gutterBottom>Quick Action</Typography>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<SendIcon />}
                onClick={() => setPostDialog(true)}
                disabled={accounts.length === 0}
              >
                Create Post
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="Connected Accounts" />
        <Tab label="Recent Posts" />
        <Tab label="Analytics" />
      </Tabs>

      {/* Tab 0: Connected Accounts */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {accounts.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                No social media accounts connected yet. Click "Connect Account" to get started.
              </Alert>
            </Grid>
          ) : (
            accounts.map((account) => (
              <Grid item xs={12} sm={6} md={4} key={account.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={account.avatarUrl}
                        sx={{
                          bgcolor: platformColors[account.platform],
                          width: 56,
                          height: 56,
                          mr: 2,
                        }}
                      >
                        {platformIcons[account.platform]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{account.accountName}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          @{account.username}
                        </Typography>
                      </Box>
                      <Chip
                        label={account.platform}
                        size="small"
                        sx={{
                          bgcolor: platformColors[account.platform],
                          color: 'white',
                          textTransform: 'capitalize',
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Followers
                        </Typography>
                        <Typography variant="h6">
                          {account.followersCount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Following
                        </Typography>
                        <Typography variant="h6">
                          {account.followingCount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Posts
                        </Typography>
                        <Typography variant="h6">{account.postsCount}</Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRefresh(account.id)}
                        title="Refresh stats"
                      >
                        <RefreshIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDisconnect(account.id)}
                        title="Disconnect"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    {account.lastSyncAt && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Last synced: {new Date(account.lastSyncAt).toLocaleString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Tab 1: Recent Posts */}
      {activeTab === 1 && (
        <Paper>
          <List>
            {posts.length === 0 ? (
              <ListItem>
                <ListItemText primary="No posts yet" secondary="Create your first post to get started" />
              </ListItem>
            ) : (
              posts.map((post, index) => (
                <React.Fragment key={post.id}>
                  {index > 0 && <Divider />}
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        src={post.account.avatarUrl}
                        sx={{ bgcolor: platformColors[post.platform] }}
                      >
                        {platformIcons[post.platform]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{post.account.accountName}</Typography>
                          <Chip label={post.status} size="small" />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ my: 1 }}>
                            {post.content}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Typography variant="caption">
                              ❤️ {post.likesCount}
                            </Typography>
                            <Typography variant="caption">
                              💬 {post.commentsCount}
                            </Typography>
                            <Typography variant="caption">
                              🔄 {post.sharesCount}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                            {post.publishedAt
                              ? `Published: ${new Date(post.publishedAt).toLocaleString()}`
                              : post.scheduledFor
                              ? `Scheduled for: ${new Date(post.scheduledFor).toLocaleString()}`
                              : 'Draft'}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      )}

      {/* Tab 2: Analytics */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Engagement Overview
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Analytics feature coming soon! Connect accounts and create posts to see detailed analytics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Connect Account Dialog */}
      <Dialog open={connectDialog} onClose={() => setConnectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Connect Social Media Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Choose a platform to connect your account
          </Typography>
          <Grid container spacing={2}>
            {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].map((platform) => (
              <Grid item xs={6} key={platform}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={platformIcons[platform]}
                  onClick={() => handleConnectPlatform(platform)}
                  sx={{
                    height: 80,
                    borderColor: platformColors[platform],
                    color: platformColors[platform],
                    '&:hover': {
                      borderColor: platformColors[platform],
                      bgcolor: `${platformColors[platform]}10`,
                    },
                  }}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={postDialog} onClose={() => setPostDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Post</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Select Account"
              value={postContent.accountId}
              onChange={(e) =>
                setPostContent({ ...postContent, accountId: Number(e.target.value) })
              }
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value={0}>Choose an account...</option>
              {accounts
                .filter((a) => a.isActive)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.platform} - @{account.username}
                  </option>
                ))}
            </TextField>

            <TextField
              label="Post Content"
              multiline
              rows={4}
              value={postContent.content}
              onChange={(e) => setPostContent({ ...postContent, content: e.target.value })}
              fullWidth
              placeholder="What's on your mind?"
            />

            <TextField
              label="Schedule For (Optional)"
              type="datetime-local"
              value={postContent.scheduledFor}
              onChange={(e) => setPostContent({ ...postContent, scheduledFor: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Alert severity="info">
              Media upload feature coming soon! For now, you can post text content.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePublishPost}
            disabled={!postContent.accountId || !postContent.content}
            startIcon={postContent.scheduledFor ? <ScheduleIcon /> : <SendIcon />}
          >
            {postContent.scheduledFor ? 'Schedule' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialMedia;
