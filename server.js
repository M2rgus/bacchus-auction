import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend/build')));

// API Routes
app.get('/api/auctions', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/auctions'); // Mock API
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching auctions:', error.message);
    res.status(500).json({ message: 'Failed to fetch auctions' });
  }
});

app.post('/api/bid', async (req, res) => {
  const { fullName, amount, productId, productName } = req.body; // Include productName
  const timestamp = new Date();

  try {
    const newBid = await prisma.bid.create({
      data: {
        fullName,
        amount: parseFloat(amount),
        timestamp,
        productId,
        productName, // Store the auction item name in the database
      },
    });

    res.json({ message: 'Bid submitted successfully!', bid: newBid });
  } catch (error) {
    console.error('Error saving bid:', error.message);
    res.status(500).json({ message: 'Failed to save bid.', error: error.message });
  }
});


// Catch-all route for React SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
