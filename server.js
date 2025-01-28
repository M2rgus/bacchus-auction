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

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('/api/auctions', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/auctions'); 
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching auctions:', error.message);
    res.status(500).json({ message: 'Failed to fetch auctions' });
  }
});

app.post('/api/bid', async (req, res) => {
  const { fullName, amount, productId, productName } = req.body;
  const timestamp = new Date();

  try {
    const newBid = await prisma.bid.create({
      data: {
        fullName,
        amount: parseFloat(amount),
        timestamp,
        productId,
        productName,
      },
    });

    res.json({ message: 'Bid submitted successfully!', bid: newBid });
  } catch (error) {
    console.error('Error saving bid:', error.message);
    res.status(500).json({ message: 'Failed to save bid.', error: error.message });
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
