import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Paper,
  CircularProgress,
  Chip,
  Fab,
  Slide,
  Divider,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
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
}

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  tokens?: number;
}

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && conversations.length === 0) {
      fetchConversations();
    }
  }, [isOpen]);

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
      const response = await api.get('/api/chatbot/conversations', {
        params: { limit: 10, status: 'active' },
      });
      const convs = response.data.data || [];
      setConversations(convs);
      
      // Auto-select most recent conversation or create new one
      if (convs.length > 0) {
        setSelectedConversation(convs[0]);
      } else {
        await handleCreateConversation();
      }
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      // Create new conversation on error
      await handleCreateConversation();
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await api.get(`/api/chatbot/conversations/${conversationId}/messages`);
      setMessages(response.data.data || []);
    } catch (error: any) {
      setError('Mesajlar yüklenemedi');
    }
  };

  const handleCreateConversation = async () => {
    try {
      const response = await api.post('/api/chatbot/conversations', {
        title: `Chat ${new Date().toLocaleDateString('tr-TR')}`,
        model: 'gpt-3.5-turbo',
        language: 'tr',
        temperature: 0.7,
      });
      const newConv = response.data.data;
      
      setConversations([newConv, ...conversations]);
      setSelectedConversation(newConv);
      setMessages([]);
      return newConv;
    } catch (error: any) {
      setError('Yeni konuşma oluşturulamadı');
      return null;
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputMessage.trim()) return;

    // Create conversation if none exists
    if (!selectedConversation) {
      const newConv = await handleCreateConversation();
      if (!newConv) return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);
    setError('');

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
        `/api/chatbot/conversations/${selectedConversation!.id}/messages`,
        { message: userMessage }
      );

      // Replace temp message with actual messages from API
      const { userMessage: actualUserMsg, assistantMessage } = response.data.data;
      
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, actualUserMsg, assistantMessage];
      });
    } catch (error: any) {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      setError(error.response?.data?.message || 'Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      await api.delete(`/api/chatbot/conversations/${selectedConversation.id}`);
      const remaining = conversations.filter(c => c.id !== selectedConversation.id);
      setConversations(remaining);
      
      if (remaining.length > 0) {
        setSelectedConversation(remaining[0]);
      } else {
        await handleCreateConversation();
      }
      setAnchorEl(null);
    } catch (error: any) {
      setError('Konuşma silinemedi');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours} sa önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: isOpen ? 'none' : 'flex',
        }}
        onClick={() => setIsOpen(true)}
      >
        <BotIcon />
      </Fab>

      {/* Chat Window */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            height: { xs: 'calc(100vh - 100px)', sm: 600 },
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BotIcon />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  AI Asistan
                </Typography>
                {selectedConversation && (
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {selectedConversation.title}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box>
              <IconButton size="small" sx={{ color: 'white' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'white' }} onClick={() => setIsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleCreateConversation}>
              <AddIcon sx={{ mr: 1 }} fontSize="small" />
              Yeni Konuşma
            </MenuItem>
            <MenuItem onClick={() => { fetchMessages(selectedConversation!.id); setAnchorEl(null); }} disabled={!selectedConversation}>
              <RefreshIcon sx={{ mr: 1 }} fontSize="small" />
              Yenile
            </MenuItem>
            <MenuItem onClick={handleDeleteConversation} disabled={!selectedConversation}>
              <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
              Konuşmayı Sil
            </MenuItem>
          </Menu>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ m: 1 }}>
              {error}
            </Alert>
          )}

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BotIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Merhaba! Size nasıl yardımcı olabilirim?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Soru sormak için mesaj yazın
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
                  <Box sx={{ display: 'flex', gap: 1, maxWidth: '85%' }}>
                    {message.role === 'assistant' && (
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <BotIcon fontSize="small" />
                      </Avatar>
                    )}
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                        color: message.role === 'user' ? 'white' : 'text.primary',
                      }}
                    >
                      {message.role === 'assistant' ? (
                        <Markdown
                          options={{
                            overrides: {
                              p: { component: Typography, props: { variant: 'body2', sx: { mb: 1 } } },
                              code: { component: 'code', props: { style: { backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: 4 } } },
                            },
                          }}
                        >
                          {message.content}
                        </Markdown>
                      ) : (
                        <Typography variant="body2">{message.content}</Typography>
                      )}
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, fontSize: '0.7rem' }}>
                        {formatTime(message.createdAt)}
                      </Typography>
                    </Paper>
                    {message.role === 'user' && (
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    )}
                  </Box>
                </Box>
              ))
            )}
            {sending && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
                <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption">Düşünüyorum...</Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input Area */}
          <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1.5, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                maxRows={3}
                placeholder="Mesajınızı yazın..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={!inputMessage.trim() || sending}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default FloatingChatWidget;
