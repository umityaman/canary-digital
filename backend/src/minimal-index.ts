// Minimal server for debugging Cloud Run deployment
import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    message: 'Minimal server running'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Minimal server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
