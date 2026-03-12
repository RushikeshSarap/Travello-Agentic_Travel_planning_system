import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import prisma from './lib/prisma.js';
import tripRoutes from './routes/tripRoutes.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/trips', tripRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Travello API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
