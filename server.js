const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Xero token exchange endpoint
app.post('/api/xero/token', async (req, res) => {
  try {
    console.log('Token exchange request:', req.body);
    
    const { code, redirect_uri, code_verifier, client_id } = req.body;
    
    if (!code || !redirect_uri || !code_verifier || !client_id) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['code', 'redirect_uri', 'code_verifier', 'client_id']
      });
    }

    const response = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        code_verifier: code_verifier,
        client_id: client_id
      })
    });
    
    const data = await response.json();
    console.log('Xero response status:', response.status);
    
    if (!response.ok) {
      console.error('Xero error:', data);
      return res.status(response.status).json(data);
    }
    
    console.log('Token exchange successful');
    res.json(data);
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Serve the HTML file at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Place your HTML file in the 'public' directory as 'index.html'`);
});
