import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Markdown from 'markdown-to-jsx';
import api from '../services/api';

interface Conversation {
  id: number;
  title?: string;
  status: string;
  language: string;
  model: string;
  updatedAt: string;
  _count?: { messages: number };
}

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  tokens?: number;
}

const AIChatbot: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [openNewConversation, setOpenNewConversation] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const [newConvSettings, setNewConvSettings] = useState({
    title: '',
    model: 'gpt-3.5-turbo',
    language: 'tr',
    temperature: 0.7,
  });

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/chatbot/conversations', {
        params: { limit: 50 },
      });
      setConversations(response.data.data || []);
      
      if (response.data.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data.data[0]);
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to fetch conversations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await api.get(`/api/chatbot/conversations/${conversationId}/messages`);
      setMessages(response.data.data || []);
    } catch (error: any) {
      showSnackbar('Failed to fetch messages', 'error');
    }
  };

  const handleCreateConversation = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/chatbot/conversations', newConvSettings);
      const newConv = response.data.data;
      
      setConversations([newConv, ...conversations]);
      setSelectedConversation(newConv);
      setOpenNewConversation(false);
      setNewConvSettings({ title: '', model: 'gpt-3.5-turbo', language: 'tr', temperature: 0.7 });
      showSnackbar('Conversation created successfully', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to create conversation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() || !selectedConversation) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // Optimistically add user message to UI
    const tempUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await api.post(
        `/api/chatbot/conversations/${selectedConversation.id}/messages`,
        { message: userMessage }
      );

      // Replace temp message with actual messages from API
      const { userMessage: actualUserMsg, assistantMessage } = response.data.data;
      
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, actualUserMsg, assistantMessage];
      });

      // Update conversation in list
      fetchConversations();
    } catch (error: any) {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      showSnackbar(error.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await api.delete(`/api/chatbot/conversations/${id}`);
      setConversations(conversations.filter(c => c.id !== id));
      
      if (selectedConversation?.id === id) {
        setSelectedConversation(conversations[0] || null);
        setMessages([]);
      }
      
      showSnackbar('Conversation deleted successfully', 'success');
    } catch (error: any) {
      showSnackbar('Failed to delete conversation', 'error');
    }
  };

  const handleArchiveConversation = async (id: number) => {
    try {
      await api.post(`/api/chatbot/conversations/${id}/archive`);
      fetchConversations();
      showSnackbar('Conversation archived successfully', 'success');
    } catch (error: any) {
      showSnackbar('Failed to archive conversation', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">İnsan Kaynakları</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenSettings(true)}>
            Ayarlar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNewConversation(true)}>
            Yeni Sohbet
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ height: 'calc(100% - 80px)' }}>
        {/* Conversations Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <List>
              {loading && conversations.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : conversations.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No conversations yet</Typography>
                  <Button size="small" sx={{ mt: 2 }} onClick={() => setOpenNewConversation(true)}>
                    Start a conversation
                  </Button>
                </Box>
              ) : (
                conversations.map((conv) => (
                  <React.Fragment key={conv.id}>
                    <ListItem
                      button
                      selected={selectedConversation?.id === conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      secondaryAction={
                        <Box>
                          <IconButton size="small" onClick={() => handleArchiveConversation(conv.id)}>
                            <ArchiveIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteConversation(conv.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={conv.title || 'New Conversation'}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {conv._count?.messages || 0} messages
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(conv.updatedAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{selectedConversation.title || 'New Conversation'}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={selectedConversation.model} size="small" color="primary" />
                      <Chip label={selectedConversation.language.toUpperCase()} size="small" />
                    </Box>
                  </Box>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <BotIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Start a conversation
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ask me anything!
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1, maxWidth: '80%' }}>
                          {message.role === 'assistant' && (
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <BotIcon />
                            </Avatar>
                          )}
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                              color: message.role === 'user' ? 'white' : 'text.primary',
                            }}
                          >
                            {message.role === 'assistant' ? (
                              <Markdown>{message.content}</Markdown>
                            ) : (
                              <Typography>{message.content}</Typography>
                            )}
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                              {formatTime(message.createdAt)}
                              {message.tokens && ` • ${message.tokens} tokens`}
                            </Typography>
                          </Paper>
                          {message.role === 'user' && (
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <PersonIcon />
                            </Avatar>
                          )}
                        </Box>
                      </Box>
                    ))
                  )}
                  {sending && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <BotIcon />
                      </Avatar>
                      <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                        <CircularProgress size={20} />
                        <Typography variant="caption" sx={{ ml: 1 }}>Thinking...</Typography>
                      </Paper>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<SendIcon />}
                      disabled={!inputMessage.trim() || sending}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <BotIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary">
                    Select a conversation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    or create a new one to start chatting
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Conversation Dialog */}
      <Dialog open={openNewConversation} onClose={() => setOpenNewConversation(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title (optional)"
            value={newConvSettings.title}
            onChange={(e) => setNewConvSettings({ ...newConvSettings, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={newConvSettings.model}
              onChange={(e) => setNewConvSettings({ ...newConvSettings, model: e.target.value })}
              label="Model"
            >
              <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, Cheaper)</MenuItem>
              <MenuItem value="gpt-4">GPT-4 (More Accurate, Slower)</MenuItem>
              <MenuItem value="gpt-4-turbo">GPT-4 Turbo (Best Balance)</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={newConvSettings.language}
              onChange={(e) => setNewConvSettings({ ...newConvSettings, language: e.target.value })}
              label="Language"
            >
              <MenuItem value="tr">Turkish</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Temperature: {newConvSettings.temperature}
            </Typography>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={newConvSettings.temperature}
              onChange={(e) => setNewConvSettings({ ...newConvSettings, temperature: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
            <Typography variant="caption" color="text.secondary">
              Lower = More focused, Higher = More creative
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewConversation(false)}>Cancel</Button>
          <Button onClick={handleCreateConversation} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chatbot Settings</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Configure your OpenAI API key in environment variables to enable AI chat functionality.
          </Alert>
          <Typography variant="body2">
            <strong>Environment Variable:</strong> OPENAI_API_KEY
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>Close</Button>
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

export default AIChatbot;
