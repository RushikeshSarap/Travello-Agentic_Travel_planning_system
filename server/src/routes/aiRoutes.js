import express from 'express';
import { getAISuggestions, suggestItinerary } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', getAISuggestions);
router.post('/itinerary', suggestItinerary);

export default router;
